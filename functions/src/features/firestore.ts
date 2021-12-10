import User from "../models/firestore/user";
import { usersCollection } from "../utils/utils";

/**
 * Gets user by id
 * @param firestore The reference to firestore. Avoid to use a singleton class
 * @param docId The user's id
 * @returns A User object or undefined if the user doesn't exist
 */
async function getUserById(firestore: FirebaseFirestore.Firestore, docId: string): Promise<User | undefined> {

    const userDoc = await firestore.collection(usersCollection).doc(docId).get();

    if (!userDoc.exists)
        return undefined;

    return User.fromJSON(userDoc.data());
}

export {
    getUserById
}