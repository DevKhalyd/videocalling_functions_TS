import LastMessage from "../models/fcm/last_message";
import Message from "../models/fcm/message";
import { MessageStateEnum } from "../models/fcm/message_state";
import Conversation from "../models/firestore/conversation";
import User from "../models/firestore/user";
import { conversationsCollection, messagesCollection, usersCollection } from "../utils/utils";

// TODO: As the functions increases in size I think its necessary a change, for example a singleton pattern
// Use the admin.firestore() function to get a Firestore instance. Necessary to create a singleton pattern


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


/**
 * Gets conversation by user id and conversation id
 * 
 * Basically in this object (doc) saves the latest message collection
 * 
 * @param firestore The reference to firestore. Avoid to use a singleton class
 * @param userdID The user's id
 * @param conversationID The conversation's id
 * @returns {Promise<Conversation | undefined>} - If returns undefined, the conversation doesn't exist so create it 
 */
async function getConversationByID(firestore: FirebaseFirestore.Firestore, userdID: string, conversationID: string): Promise<Conversation | undefined> {
    const conversationDoc = await firestore.collection(usersCollection).doc(userdID).collection(conversationsCollection).doc(conversationID).get();
    if (!conversationDoc.exists)
        return undefined;
    return Conversation.fromJSON(conversationDoc.data());
}

/**
 * Creates conversation
 * 
 * @param firestore  The reference to firestore. Avoid to use a singleton class
 * @param userdID The user's id
 * @param conversation The conversation to create
 * @returns {Promise<boolean>} - If returns true, the conversation was created
 */
async function createConversation(firestore: FirebaseFirestore.Firestore, userdID: string, conversation: Conversation): Promise<boolean> {
    try {
        const options: FirebaseFirestore.SetOptions = { merge: true };
        await firestore.collection(usersCollection).doc(userdID).collection(conversationsCollection).doc(conversation.id).set(conversation.toJSON(), options);
        return true;
    } catch (error) {
        return false;
    }
}


/**
 * 
 * Update / create the LastMessage of a conversation
 * 
 * @param firestore The reference to firestore. Avoid to use a singleton class
 * @param userID The user's id
 * @param conversartionId The conversation's id
 * @param lastMessage The last message
 * @returns {Promise<boolean>} - If returns true, the last message was updated or created successfully
 */
async function updateLastMessage(
    firestore: FirebaseFirestore.Firestore,
    userID: string,
    conversartionId: string,
    lastMessage: LastMessage,
): Promise<boolean> {
    try {
        await firestore.collection(usersCollection)
            .doc(userID)
            .collection(conversationsCollection)
            .doc(conversartionId)
            .update({ lastMessage: lastMessage.toJSON() });
        return true;
    } catch (error) {
        return false;
    }
}


/**
 * Gets acumulative messages for a user given
 * 
 * @param firestore  The reference to firestore. Avoid to use a singleton class
 * @param idConversation The conversation's id
 * @param idUser The user's id to compare with the other one
 * @returns {Promise<number>}  The number of messages unreaded
 */
async function getAcumulativeMessages(
    firestore: FirebaseFirestore.Firestore,
    idConversation: string,
    idUser: string,
): Promise<number> {

    const snapshot = await firestore.collection(conversationsCollection).doc(idConversation).
        collection(messagesCollection).where("messageState.type", "==", MessageStateEnum.Delivered).get();

    if (snapshot.empty)
        return 0;

    let totalMessages = 0;

    snapshot.forEach(doc => {
        const msg = new Message(doc.data());
        if (msg.idUser !== idUser) totalMessages++;
    });

    return totalMessages;
}

/**
 * Adds new user
 * 
 * @param firestore The reference to firestore. Avoid to use a singleton class
 * @param id The user's id
 * @param user The user to add
 */
async function addNewUser(
    firestore: FirebaseFirestore.Firestore,
    id: string,
    user: User,
) {
    await firestore.collection(usersCollection).doc(id).set(user.toJSON());
}

async function addNewMessage(
    firestore: FirebaseFirestore.Firestore,
    idConversation: string,
    message: Message,
) {
    await firestore.collection(conversationsCollection).doc(idConversation).collection(messagesCollection).add(message.toJSON());
}
/**
 * Create a new conversation in firestore
 * 
 * @param firestore The reference to firestore. Avoid to use a singleton class
 * @param id The conversation's id 
 * @param idsUser The id users who are involved in the conversation
 */
async function createNewConversation(
    firestore: FirebaseFirestore.Firestore,
    id: string,
    idsUser: string[],
) {
    await firestore.collection(conversationsCollection).doc(id).set({
        id,
        idsUser,
    });
}

export {
    getUserById,
    getConversationByID,
    createConversation,
    updateLastMessage,
    getAcumulativeMessages,
    addNewUser,
    createNewConversation,
    addNewMessage
}