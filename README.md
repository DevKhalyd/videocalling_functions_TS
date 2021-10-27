# VideoCallingFunctions TS

Reacts to the changes in the database.

Basically the sucessor of the previous project. This because TS helps a lot to write code mantainable.

Previous project: https://github.com/DevKhalyd/videocalling_functions

REMEMBER: Always when a change occurs in the TS code. Run the command tsc to transpilate the code to JS and execute the changes in the current environment.

# Commands

**Serve the server:** `npm run server` Run this command inside functions folder

`firebase emulators:start` Start to emulate

`firebase emulators:start --only functions` - Add firestore to execute as well

**See all the commands avaible:** https://firebase.google.com/docs/emulator-suite/install_and_configure

# Organize files

https://firebase.google.com/docs/functions/organize-functions

https://stackoverflow.com/questions/43486278/how-do-i-structure-cloud-functions-for-firebase-to-deploy-multiple-functions-fro

# Reference

TS source: https://firebase.google.com/docs/functions/typescript#using_an_existing_typescript_project

Note: Check the part of predeply for TS

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
