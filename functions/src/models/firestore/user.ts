export default class User {

    readonly imageUrl: string | undefined;
    readonly fullname: string;
    readonly username: string;
    readonly tokenFCM: string | undefined;


    /**
     * Creates an instance of user.
     * @param o The json object
     */
    constructor(o: any) {
        this.imageUrl = o.imageUrl;
        this.fullname = o.fullname;
        this.username = o.username;
        this.tokenFCM = o.tokenFCM;
    }


    static fromJSON(o: any): User {
        return new User(o);
    }
}