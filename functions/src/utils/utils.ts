import * as  bcrypt from "bcrypt";

/// Changes by the number in the envionment
const saltRounds = 10;

// Export for other file
function encryptPassword(password: string, callback: (err: Error | undefined, encrypted: string) => any) {
    return bcrypt.hash(password, saltRounds, callback)
}

export default encryptPassword
