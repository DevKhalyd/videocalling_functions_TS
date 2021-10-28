// NOTE: If this file reach the 200 lines seperate each function to be more readable.
import * as  admin from "firebase-admin";
import * as functions from "firebase-functions";
import encryptPassword from "./utils/bcrypt";
import { CallState } from "./utils/enums";

import {
    callsCollection,
    usernamesUnavaibleCollection,
    usersCollection,
} from "./utils/const";


// The Firebase Admin SDK to access Firestore.
admin.initializeApp();

const firestore = functions.firestore;
const logger = functions.logger;

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
        // Add to the collections usernames this username as unavaible
        snap.ref.firestore.collection(usernamesUnavaibleCollection).add({ username });

        return snap.ref.set({ username_query: username.split('') }, { merge: true });
    });


exports.onCreateCall = firestore.document(`/${callsCollection}/{documentId}`)
    .onCreate(async (snap, _) => {

        // Reference to the this document
        const ref = snap.ref;

        const changeCallState = (callState: CallState) => {
            return ref.update({ callState });
        };

        // Reference: https://stackoverflow.com/a/64720633/10942018
        // Set a timestamp for this call and this allow to search by datetime in the collection
        ref.update({ timestamp: admin.firestore.FieldValue.serverTimestamp() });


        const data = snap.data();

        // TODO: Create a functions that changes the state of the call to finalize because the data given was incorrect

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
        // NOTE: Or return a Promise
        return 0;
    });