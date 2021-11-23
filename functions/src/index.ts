import * as  admin from "firebase-admin";
import * as functions from "firebase-functions";
import encryptPassword from "./features/bcrypt";
import { CallState } from "./utils/enums";
import { sendVideoCallNotification } from "./features/fcm";

import {
    callsCollection,
    usernamesUnavaibleCollection,
    usersCollection,
} from "./utils/const";
import createTokenandChannel from "./features/agora";


// The Firebase Admin SDK to access Firestore.
admin.initializeApp();

const firestore = functions.firestore;
const logger = functions.logger;
/// Listen to the users collection
const listenToCollection = `/${callsCollection}/{documentId}`;

// When a new user is created in the collections $usersCollection the password is encrypted.
// Also  adds a new document to $usernamesUnavaibleCollection collection to identify if the username is duplicated.
// Lastly, add a new param in the user to search for array and fetch the user that contains that characters.
exports.onCreateUser = firestore.document(listenToCollection)
    .onCreate((snap, _) => {
        const data = snap.data();
        const password = data.password;
        const username = data.username;
        encryptPassword(password, (err, newPassword) => {
            if (!err)
                return snap.ref.update({ password: newPassword });
        })
        // Add to the collections usernames this username as unavaible
        snap.ref.firestore.collection(usernamesUnavaibleCollection).add({ username });

        return snap.ref.set({ username_query: username.split('') }, { merge: true });
    });

// Handle the states and creates the data necessary for the call between the two users.
exports.onCreateCall = firestore.document(`/${callsCollection}/{documentId}`)
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
         * The call with the latest information
         */
        const newData = change.after.data();

        const callState = newData.callState.type;

        if (!callState) {
            logger.error(`The callState is not defined: ${callState}`);
            return 0;
        }

        if (callState <= CallState.OnCall) {
            logger.info(`The callState is not Finalized or Lost: ${callState}. Not update needed.`);
            return 0;
        }

        if (callState > CallState.Finalized) {
            logger.error(`The callState is not a correct value: ${callState}. Must be between 3 and 4.`);
            return 0;
        }





    });

/* Just for testing purposes
// http://localhost:5001/videocalling-flutter-26813/us-central1/test
// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.test = functions.https.onRequest(async (_, res) => {
    // Send back a message that we've successfully written the message
    //  await getLatestCryptoResponse();
    const token = 'c390aPiMSxyf0fJAiVc-FR:APA91bHuIB2Mkw-t473hIMVv1HeyKyeTpvOBwqhjN-Z9ZNyGmG3jm7P-iPxNF98QcqWPgaV__2_3VGvkBzGbF2dqzFAb2UUz1npFQM6L8JbvPUpJ65Ey-jj8-WSF1mmYBRFLPcp__KIw';
    const idVideocall = 'asdsad';
    const username = 'username';
    sendVideoCallNotification(token, idVideocall, username, undefined).then(() => {
        res.send("Process ended");
    })
});*/