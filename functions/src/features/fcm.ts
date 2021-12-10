import { messaging } from "firebase-admin";
import { logger } from "firebase-functions/v1";
import { videocallingNotificationDurationMs } from "../utils/utils";

/// Transform to an image with background color with cloud functions
const _image = 'https://lacollege.edu/wp-content/uploads/2021/09/blank-profile-picture.png';

/**
 * @param {string} token - FCM token provided by the Call object
 * @param {string} idVideocall - ID of the videocall createed by Agora
 * @param {string} username - Username of the user who is calling to the other user
 * @param {string | undefined} imageUrl - Image URL of the user who is calling to the other user
 * @returns {Promise<boolean>} Returns true if the message was sent successfully
 */
function sendVideoCallNotification(
    token: string,
    idVideocall: string,
    username: string,
    imageUrl: string | undefined,
): Promise<boolean> {

    const data = {
        idVideocall,
        username,
        image: imageUrl ?? _image,
    }

    const android: messaging.AndroidConfig = {
        priority: 'high',
        ttl: videocallingNotificationDurationMs,
    };

    // IOS devices. According to the documentation, the priority is 5 and sholdn't be changed
    // NOTE: Check the config for this one.
    //const apns: messaging.ApnsConfig = {}

    // Using: (Data messages)https://firebase.google.com/docs/cloud-messaging/concept-options#data_messages
    const message: messaging.Message = {
        token,
        android,
        data,
        //apns
    }

    return messaging().send(message).then(_ => {
        return true;
    }).catch(() => {
        logger.info("Message doesn't sent successfully");
        return false;
    });
}

function sendMessageNotification() {

}

export {
    sendVideoCallNotification,
    sendMessageNotification
}