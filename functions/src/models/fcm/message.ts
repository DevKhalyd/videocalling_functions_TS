import MessageType from "./message_type";

export default class Message {
    readonly idUser: string;
    readonly messageType: MessageType;
    readonly data: string | undefined;

    /**
     * 
     * @param idUser - The id of the user who sent the message
     * @param messageType - The type of the message (Text,Image,Audio)
     * @param data - The data of the message
     * 
     */
    constructor(o: any) {
        this.idUser = o.idUser;
        this.messageType = new MessageType(o.messageType);
        this.data = o.data;
    }

    static fromJSON(o: any): Message {
        return new Message(o);
    }
}