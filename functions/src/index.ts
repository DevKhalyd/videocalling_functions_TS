
import * as  admin from "firebase-admin";
import * as functions from "firebase-functions";
import encryptPassword from "./utils/utils";
import { usernamesUnavaible, usersCollection } from "./utils/const";


// The Firebase Admin SDK to access Firestore.
admin.initializeApp();


// When a new user is created in the collections $usersCollection the password is encrypted.
// Also  adds a new document to $usernamesUnavaible collection to identify if the username is duplicated.
// Lastly, add a new param in the user to search for array and fetch the user that contains that characters.
exports.updateUser = functions.firestore.document(`/${usersCollection}/{documentId}`)
    .onCreate((snap, _) => {
        const data = snap.data();
        const password = data.password;
        const username = data.username;
        encryptPassword(password, (err, newPassword) => {
            functions.logger.log('EncryptedPassword: ', newPassword);
            if (!err)
                return snap.ref.update({ newPassword });
        })
        functions.logger.log('Adding to a new collection');
        // Add to the collections usernames this username as unavaible
        snap.ref.firestore.collection(usernamesUnavaible).add({ username });

        functions.logger.log('Lastly, converto to a list');
        return snap.ref.set({ username_query: username.split('') }, { merge: true });
    });

