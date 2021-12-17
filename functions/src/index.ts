import * as  admin from "firebase-admin";
import * as functions from "firebase-functions";
import encryptPassword from "./features/bcrypt";
import { CallState, CallType } from "./utils/enums";
import { sendMessageNotification, sendVideoCallNotification } from "./features/fcm";

import {
    callsCollection,
    conversationsCollection,
    existsInArray,
    getHistoryCollection,
    messagesCollection,
    usernamesUnavaibleCollection,
    usersCollection,
} from "./utils/utils";
import createTokenandChannel from "./features/agora";
import Message from "./models/fcm/message";
import { addNewMessage, addNewUser, createConversation, createNewConversation, getAcumulativeMessages, getConversationByID, getUserById, updateLastMessage } from "./features/firestore";
import Conversation from "./models/firestore/conversation";
import LastMessage from "./models/fcm/last_message";
import MessageState, { MessageStateEnum } from "./models/fcm/message_state";
import User from "./models/firestore/user";

// TODO: Read all the code and verify that each Promise use an await keyword. Because the cloud functions kills the threads if ends before each thread ends.

// The Firebase Admin SDK to access Firestore.
admin.initializeApp();

const firestore = functions.firestore;
const logger = functions.logger;
/// Listen to the calls collection
const listenToCollection = `/${callsCollection}/{documentId}`;
/// Listen when a new messages is sent.
/// Basically listen a collection inside another collection
const listenMessagesCollection = `/${conversationsCollection}/{documentId}/${messagesCollection}/{documentId}`;

// When a new user is created in the collections $usersCollection the password is encrypted.
// Also  adds a new document to $usernamesUnavaibleCollection collection to identify if the username is duplicated.
// Lastly, add a new param in the user to search for array and fetch the user that contains that characters.
exports.onCreateUser = firestore.document(`/${usersCollection}/{documentId}`)
    .onCreate((snap, _) => {
        const data = snap.data();
        const password = data.password;
        const username = data.username;
        encryptPassword(password, (err, newPassword) => {
            if (!err)
                return snap.ref.update({ password: newPassword });
        })
        // Add to the collections usernames because now this username is unavaible
        snap.ref.firestore.collection(usernamesUnavaibleCollection).add({ username });

        return snap.ref.set({ username_query: username.split('') }, { merge: true });
    });

// Handle the states and creates the data necessary for the call between the two users.
exports.onCreateCall = firestore.document(listenToCollection)
    .onCreate(async (snap, _) => {

        // Reference to the this document
        const ref = snap.ref;

        // Change the state of the call.
        const changeCallState = (callState: CallState) => {
            // Nested update
            return ref.update({ 'callState.type': callState });
        };

        // Reference: https://stackoverflow.com/a/64720633/10942018
        // Set a timestamp for this call and this allow to search by datetime in the collection
        ref.update({ timestamp: admin.firestore.FieldValue.serverTimestamp() });

        // Get the data of the call
        const data = snap.data();

        // 1. Update the call document with USERS data
        const participantsIds = data.participantsIds as string[];
        if (!participantsIds) {
            logger.error('No participantsIds available. This error should not happen, because the application always should send the IDs');
            return changeCallState(CallState.Finalized);
        }

        if (participantsIds.length !== 2) {
            logger.error('IDs length not correct. Please send the corret lenght of IDs');
            return changeCallState(CallState.Finalized);
        }

        const participantIDCaller = participantsIds[0];
        const participantIDReceiver = participantsIds[1];

        /// Get each user to save in the call collection
        const refFirestore = snap.ref.firestore;
        const usersCollectionFirestore = refFirestore.collection(usersCollection);

        const callerData = await usersCollectionFirestore.doc(participantIDCaller).get();
        const receiverData = await usersCollectionFirestore.doc(participantIDReceiver).get();

        const caller = callerData.data();
        const receiver = receiverData.data();


        if (!caller || !receiver) {
            logger.error(
                `The Caller or Receiver don"t exists. Please review the following IDS: Caller: ${participantIDCaller} - Receiver: ${participantIDReceiver}`);
            return changeCallState(CallState.Finalized);
        }

        // Delete passwords
        delete caller.password;
        delete receiver.password;

        // Delete username_query
        delete caller.username_query;
        delete receiver.username_query;

        // 2. Update the call document with USERS data
        ref.update({ caller, receiver });

        // Send notifications to the users though the FCM
        const tokenFCMReceiver = receiver.tokenFCM;

        if (!tokenFCMReceiver) {
            logger.error(`The Receiver don't have a tokenFCM. Please review the following ID: ${participantIDReceiver}`);
            return changeCallState(CallState.Finalized);
        }
        const idCall = snap.id;
        const callerUserName = caller.username;
        const callerImageUrl = caller.imageUrl;

        // Send the notification to the receiver
        const wasSent = await sendVideoCallNotification(tokenFCMReceiver, idCall, callerUserName, callerImageUrl);

        if (!wasSent) {
            logger.error(`The notification was not sent to the Receiver. Might be because the receiver is offline`);
            return changeCallState(CallState.Finalized);
        }

        // Update the call with the token and the channel name if everything was ok
        const { token, channel } = createTokenandChannel();

        ref.update({ token, channel });
        // The Caller and Receiver are avaible
        return changeCallState(CallState.Calling);
    });

/// Listen to the calls when are updated.
exports.onUpdateCall = firestore.document(listenToCollection)
    .onUpdate(async (change, _) => {

        /**
         * Show an error and terminates the process.
         * 
         * @param error - The error that occurred
         * @returns 0 to allow the functions works properly
         */
        const showError = (error: string) => {
            logger.error(error);
            return 0;
        };

        /**
         * The call object with the latest information
         */
        const newData = change.after.data();

        const callState = newData.callState.type;

        if (callState === undefined)
            return showError(`The callState is not defined: ${callState}`);

        /// Neither the state lost nor finalized yet
        if (callState < CallState.Lost)
            return 0;

        if (callState > CallState.Finalized)
            return showError(`The callState is not a correct value: ${callState}. Must be between 3 and 4.`);

        /// The participants in this conversation
        const participantsIds = newData.participantsIds as string[] | undefined;

        if (participantsIds?.length !== 2)
            return showError('The participantsIds is not defined. This error should not happen, because the application always should contains the IDs');

        /// Check the flowchart to see how works...
        /// Help to update each user with the HistoryCall
        const participantIDCaller = participantsIds[0];
        const participantIDReceiver = participantsIds[1];

        /// Shared Data
        const date = newData.date;
        // If it{s videocall or call}
        // NOTE: Use: conversationType.type as string
        const conversationType = newData.conversationType.type as number;

        /// Caller Data
        const callerFullName = newData.caller.fullname;
        const callerImageUrl = newData.caller.imageUrl;
        const callerUsername = newData.caller.username;
        const callerCallType = CallType.Outcoming;

        /// Receiver Data
        const receiverFullName = newData.receiver.fullname;
        const receiverImageUrl = newData.receiver.imageUrl;
        const receiverUsername = newData.receiver.username;
        const receiverCallType = CallType.Incoming;

        const getHistoryCallAsObject = (
            id: string,
            imgUrl: string | undefined,
            fullname: string,
            username: string,
            date: string,
            conversationType: number,
            callType: CallType
        ) => {
            return {
                'idUser': id,
                imgUrl,
                fullname,
                username,
                date,
                'conversationType': { type: conversationType },
                'callType': { type: callType },
            }
        }

        const callerObject = getHistoryCallAsObject(
            participantIDCaller,
            callerImageUrl,
            callerFullName,
            callerUsername,
            date,
            conversationType,
            callerCallType);

        const receiverObject = getHistoryCallAsObject(
            participantIDReceiver,
            receiverImageUrl,
            receiverFullName,
            receiverUsername,
            date,
            conversationType,
            receiverCallType);

        /// Adding this call to the history of each user
        const callerCollection = change.after.ref.firestore.collection(getHistoryCollection(participantIDCaller));
        const receiverCollection = change.after.ref.firestore.collection(getHistoryCollection(participantIDReceiver));

        callerCollection.add(callerObject);
        return receiverCollection.add(receiverObject);
    });

/* Context: $listenMessagesCollection in that collection the 
messages are stored. Then when a new message is added (created) the function 
is triggered to update the object LastMessage for each user in the
database. Both of them should exists
*/
exports.onCreateMessages = firestore.document(listenMessagesCollection)
    .onCreate(async (snap, _) => {

        /*
            Help to print messages in the console and end the process
        */
        const zero = (message: string | undefined = undefined) => {
            if (message)
                logger.error(message);
            return 0;
        };

        const firestore = snap.ref.firestore;

        // Get the parent of this collection
        const path = snap.ref.path;

        /// collection/documentId
        const components = path.split('/');

        if (!components) return zero(`No components found in ${path}`);

        const documentId = components[1];

        const collection = firestore.collection(conversationsCollection);

        const doc = await collection.doc(documentId).get();

        if (!doc.exists) return zero(`The document ${documentId} doesn't exists`);

        const data = doc.data();

        if (!data) return zero(`The data of the document ${documentId} doesn't exists`);

        /**
         * According to the backend design, this id is the same that the user conversartion list.
         */
        const idConversation = data.id as string | undefined;

        /**
          The ids of the participants in this  conversation     
        */
        const idsUser = data.idsUser as string[] | undefined;

        if (idsUser?.length !== 2 || !idConversation) return zero(`Data not work properly. IDSUSER: ${idsUser} - ID: ${idConversation}`);

        /** 
            The new message sent (created) in this conversation
        */
        const currentMessage = new Message(snap.data());

        /**
            The id of the user who send the message.
        */
        const idUser = currentMessage.idUser;

        /// Just verify if the user who send the message is in the conversation, otherwise something is wrong
        if (!existsInArray(idUser, idsUser)) return zero(`The idUser ${idUser} is not in the array ${idsUser}`);

        // Ids of each user
        const userIDA = idsUser[0];

        const userIDB = idsUser[1];

        // Data of each user
        const userA = await getUserById(firestore, userIDA);

        const userB = await getUserById(firestore, userIDB);

        if (!userA || !userB) return zero(`The user ${userIDA} or ${userIDB} doesn't exists`);

        /**
         * Help to indentify the user who send the message.
         * 
         * In this case If this condition returns true then the user who send the message is the userA
         * otherwise the user who send the message is the userB
         */
        const isUserA = idUser === userIDA;

        /**
         * The tokenFCM to send a notification that have a new message
         */
        const tokenFCM = isUserA ? userB.tokenFCM : userA.tokenFCM;

        // Data to send the message of a new notification.
        const fullname = isUserA ? userB.fullname : userA.fullname;

        const imageUrl = isUserA ? userB.imageUrl : userA.imageUrl;

        if (tokenFCM) sendMessageNotification(tokenFCM, fullname, currentMessage.getMessage(), imageUrl);

        // Verify if the conversations already exists otherwise create it

        const createANewConversation = async (idUser: string, conversation: Conversation) => {
            await createConversation(firestore, idUser, conversation);
        };

        const conversationA = await getConversationByID(firestore, userIDA, idConversation);

        if (!conversationA) {
            const newConversationA = Conversation.fromParameters(
                idConversation,
                userIDB,
                userB.fullname,
                userB.username,
                userB.imageUrl,
            );
            await createANewConversation(userIDA, newConversationA);
        }

        const conversationB = await getConversationByID(firestore, userIDB, idConversation);

        if (!conversationB) {
            const newConversationB = Conversation.fromParameters(
                idConversation,
                userIDA,
                userA.fullname,
                userA.username,
                userA.imageUrl,
            );
            await createANewConversation(userIDB, newConversationB);
        }

        // Update the last message of each user
        // TODO: Creating the last message is not creating the conversation in the database.

        const createLastMessage = (messageStateEnum: MessageStateEnum, acumalativeMessages: number = 0) => {
            const date = admin.firestore.FieldValue.serverTimestamp();
            return LastMessage.fromParameters(
                currentMessage.messageType,
                new MessageState(messageStateEnum),
                date,
                currentMessage.data,
                acumalativeMessages,
            );
        };

        let acumalativeMessagesForUserA = 0;
        let acumalativeMessagesForUserB = 0;

        /// The user A acts as receiver...
        if (!isUserA)
            acumalativeMessagesForUserA = await getAcumulativeMessages(firestore, idConversation, userIDA);
        else
            acumalativeMessagesForUserB = await getAcumulativeMessages(firestore, idConversation, userIDB);

        const lastMessageForA = createLastMessage(isUserA ? MessageStateEnum.Seen : MessageStateEnum.Delivered, acumalativeMessagesForUserA);

        const lastMessageForB = createLastMessage(isUserA ? MessageStateEnum.Delivered : MessageStateEnum.Seen, acumalativeMessagesForUserB);

        await updateLastMessage(firestore, userIDA, idConversation, lastMessageForA);

        await updateLastMessage(firestore, userIDB, idConversation, lastMessageForB);

        return 0;
    });

/* 
    Testing purposes
    Examples: 
    https://firebase.google.com/docs/functions/get-started#review_complete_sample_code
*/

const idConversation = 'idConversation';
const tes1 = 'test1';
const tes2 = 'test2';
const idsUser = [tes1, tes2];

//https://firebase.google.com/docs/functions/firestore-events#define_a_function_trigger

exports.setup = functions.https.onRequest(async (_, res) => {

    const adminFirestore = admin.firestore();

    // Add the users A and B objects
    await addNewUser(adminFirestore, tes1, User.forTesting(tes1));
    await addNewUser(adminFirestore, tes2, User.forTesting(tes2));

    await createNewConversation(adminFirestore, idConversation, idsUser);


    res.send('Setup done');
});

exports.addMessageConversation = functions.https.onRequest(async (_, res) => {

    await addNewMessage(admin.firestore(), idConversation, Message.forTesting(tes1));

    res.send('Add message done');
});
