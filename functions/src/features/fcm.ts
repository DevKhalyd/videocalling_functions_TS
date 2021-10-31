import { messaging } from "firebase-admin";
import { logger } from "firebase-functions/v1";
import { videocallingNotificationDurationMs } from "../utils/const";


/**
 * @param {string} token - FCM token provided by the Call object
 * @param {string} idVideocall - ID of the videocall createed by Agora
 * @param {string} name - Name of the user who is calling to the other user
 * @param {string | undefined} imageUrl - Image URL of the user who is calling to the other user
 * @returns {Promise<boolean>} Returns true if the message was sent successfully
 * 
 */
function sendVideoCallNotification(
    token: string,
    idVideocall: string,
    name: string,
    imageUrl: string | undefined,
): Promise<boolean> {

    const data = {
        idVideocall
    }

    const android: messaging.AndroidConfig = {
        priority: 'high',
        ttl: videocallingNotificationDurationMs,
    };

    // IOS devices. According to the documentation, the priority is 5 and sholdn't be changed
    // NOTE: Check the config for this one.
    //const apns: messaging.ApnsConfig = {}

    const notification: messaging.Notification = {
        title: "Call incoming...",
        body: `${name} wants to talk with you.`,
        imageUrl
    }

    const message: messaging.Message = {
        token,
        notification,
        android,
        data,
        //apns
    }

    return messaging().send(message).then(id => {
        logger.info(`Message sent successfully. ID: ${id}`);
        return true;
    }).catch(() => {
        logger.info('Message doesn"t sent successfully');
        return false;
    });
}

export {
    sendVideoCallNotification
}