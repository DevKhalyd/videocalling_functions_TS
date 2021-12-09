enum MessageTypeEnum {
    Text,
    Image,
    Audio,
}
/**
 * 
 * What type of message send the user to the server
 * 
 * */
class MessageType {

    readonly type: MessageTypeEnum;

    /**
     * 
     * @param type - Type of the message
     * 
     */
    constructor(o: any) {
        this.type = o.type;
    }

    static fromJSON(o: any): MessageType {
        return new MessageType(o);
    }

}

export {
    MessageType as default,
    MessageTypeEnum,
}