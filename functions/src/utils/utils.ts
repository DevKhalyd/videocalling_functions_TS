const usersCollection = 'users';
const usernamesUnavaibleCollection = 'usernames_unavaible';
const conversationsCollection = 'conversations';
const messagesCollection = 'messages';
const callsCollection = 'calls';
const historyCallsCollection = 'history_calls';

/*
On Android and Web/JavaScript, you can specify the maximum 
lifespan of a message. The value must be a duration from 
0 to 2,419,200 seconds (28 days), and it corresponds to the 
maximum period of time for which FCM stores and attempts to 
deliver the message.
Docs: https://firebase.google.com/docs/cloud-messaging/concept-options#ttl
*/

/*
FCM guarantees best effort for messages that must be delivered 
"now or never." Keep in mind that a time_to_live value of 0 means 
messages that can't be delivered immediately are discarded. 
*/
const videocallingNotificationDurationMs = 0;

/**
 * 
 * Tries until one hour to send the notification.
 * 
 */
const messageNotificationDuration = 3600;



/// Image to show in the notification by default
const image = 'https://lacollege.edu/wp-content/uploads/2021/09/blank-profile-picture.png';

/**
 * Use to get the historyCalls path and do some actions on it
 * 
 * @param doc The id of the document to update (User)
 * @returns The path of the document to update
 */
function getHistoryCollection(doc: string): string {
    return `${usersCollection}/${doc}/${historyCallsCollection}`;
}

function existsInArray(element: string, array: string[]): boolean {
    return array.indexOf(element) > -1;
}

/**
 * Gets random int.
 * 
 * Example:
 * 
 * console.log(getRandomInt(3));
 * expected output: 0, 1 or 2
 * 
 * @param max The limit to get the random number
 * @returns {number}  The random number
 */
function getRandomInt(max: number) {
    if (max < 1) throw new Error(`The number must be greater than 0`);
    return Math.floor(Math.random() * max);
}

export {
    usersCollection,
    usernamesUnavaibleCollection,
    callsCollection,
    videocallingNotificationDurationMs,
    conversationsCollection,
    messagesCollection,
    messageNotificationDuration,
    image,
    getHistoryCollection,
    existsInArray,
    getRandomInt
}