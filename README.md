# VideoCallingFunctions TS

Reacts to the changes in the database.

Basically the sucessor of the previous project. This because TS helps a lot to write code mantainable.

Previous project: https://github.com/DevKhalyd/videocalling_functions

REMEMBER: Always when a change occurs in the TS code. Run the command tsc to transpilate the code to JS and execute the changes in the current environment.

# Commands (Run inside functions)

**Serve the server:** `npm run server` Run this command inside functions folder

`firebase emulators:start` Start to emulate

`firebase emulators:start --only functions` - Add firestore to execute as well

**See all the commands avaible:** https://firebase.google.com/docs/emulator-suite/install_and_configure

`npm run deploy` Deploy the functions to the cloud

# Organize files

https://firebase.google.com/docs/functions/organize-functions

https://stackoverflow.com/questions/43486278/how-do-i-structure-cloud-functions-for-firebase-to-deploy-multiple-functions-fro

# Env variables

https://cloud.google.com/functions/docs/configuring/env-var#functions-deploy-command-nodejs

# Reference

TS source: https://firebase.google.com/docs/functions/typescript#using_an_existing_typescript_project

Note: Check the part of predeploy for TS

# Logs

```ts
functions.logger.log("Adding to a new collection");
```

# Extra config

```json
"auth": {
      "port": 9099
 }
```

# NOTE

According to the documentation of Cloud functions in each function should return a promise or a zero to work properly.

# Notifications

If can, add the image to the notification https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#Notification

Doc about the payload of each notifications:
https://firebase.google.com/docs/cloud-messaging/concept-options#notifications

Doc aboutt the life span of the notification: https://firebase.google.com/docs/cloud-messaging/concept-options#ttl

So basically the notification will be sent to the user for a certain time with the high priorioty and a payload to know where go.

# Notifications IOS (a little tricky)

Basically I have to manage the time in UNIX epoch. So I should get the current time and add 5 seconds to the current time. This because APN don't store the notification. Because a videocall notifications is not for always.

APNS DOCS:
https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns

UNIX CONVERTER:

https://www.epochconverter.com/

Check the lifespan

## How to document Typescript

https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
