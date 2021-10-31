import * as  bcrypt from "bcrypt";

/// TODO: Changes by a secret key in the process.env of cloud functions 
const saltRounds : string | number =  10;

// Export for other file
function encryptPassword(password: string, callback: (err: Error | undefined, encrypted: string) => any) {
    return bcrypt.hash(password, saltRounds, callback);
}

export default encryptPassword
