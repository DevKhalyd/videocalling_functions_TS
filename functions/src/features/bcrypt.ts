import * as  bcrypt from "bcrypt";
import { logger } from "firebase-functions/v1";
const saltRounds: string | number = process.env.SALT_ROUNDS || 5;

// Export for other file
function encryptPassword(password: string, callback: (err: Error | undefined, encrypted: string) => any) {

    if (typeof saltRounds !== "string") {
        logger.warn("Local environment detected. If you are in production make sure that the SALT_ROUNDS variable is set already");
    }

    return bcrypt.hash(password, saltRounds, callback);
}

export default encryptPassword
