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

    toJSON(): any {
        return {
            imageUrl: this.imageUrl,
            fullname: this.fullname,
            username: this.username,
            tokenFCM: this.tokenFCM
        };
    }


    static fromJSON(o: any): User {
        return new User(o);
    }

    static fromParameters(imageUrl: string | undefined, fullname: string, username: string, tokenFCM: string | undefined): User {
        return new User({ imageUrl, fullname, username, tokenFCM });
    }

    static forTesting(name: string): User {
        return new User({ imageUrl: undefined, fullname: `full-${name}`, username: `user-${name}`, tokenFCM: undefined });
    }



}