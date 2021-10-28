import { messaging } from "firebase-admin";
import { logger } from "firebase-functions/v1";



// TODO: Add the onClick function to the notification

function sendVideoCallNotification(
    token: string,
    idVideocall: string,
    name: string,
    img: string | undefined,
): Promise<boolean> {

    // TODO: Check with IOS how to use the high priority notification

    const data = {
        idVideocall
    }

    const android: messaging.AndroidConfig = {
        priority: 'high',
    };

    const notification: messaging.Notification = {
        title: "Call incoming...",
        body: `${name} wants to talk with you.`,
        imageUrl: img,
    }

    const message: messaging.Message = {
        token,
        notification,
        android,
        data
    }


    return messaging().send(message).then(() => {
        logger.info('Message sent successfully');
        return true;
    }).catch(() => {
        logger.info('Message doesn"t sent successfully');
        return false;
    });

}

