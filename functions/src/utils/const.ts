const usersCollection = 'users';
const usernamesUnavaibleCollection = 'usernames_unavaible';
const callsCollection = 'calls';

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

export {
    usersCollection,
    usernamesUnavaibleCollection,
    callsCollection,
    videocallingNotificationDurationMs
}