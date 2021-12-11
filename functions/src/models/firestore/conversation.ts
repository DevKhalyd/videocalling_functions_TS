
/**
 * The conversation in each user
 */
export default class Conversation {

    /**
     * Id  of conversation
     */
    readonly id: string;
    readonly idUser: string;
    readonly fullname: string;
    readonly username: string;
    readonly imgUrl: string | undefined;

    /**
     * Creates an instance of conversation.
     * @param o The object from Firebase
     */
    constructor(o: any) {
        this.id = o.id;
        this.idUser = o.idUser;
        this.fullname = o.fullname;
        this.username = o.username;
        this.imgUrl = o.imgUrl;
    }

    /**
     * Because create other constructor does not match with the initial constructor.
     * I made this method to create a new instance of the class.
     */
    static fromParameters(id: string, idUser: string, fullname: string, username: string, imgUrl: string | undefined): Conversation {
        return new Conversation({
            id,
            idUser,
            fullname,
            username,
            imgUrl,
        });
    }


    static fromJSON(o: any): Conversation {
        return new Conversation(o);
    }

    toJSON(): any {
        return {
            id: this.id,
            idUser: this.idUser,
            fullname: this.fullname,
            username: this.username,
            imgUrl: this.imgUrl,
        };
    }

}