import MessageState from "./message_state";
import MessageType, { MessageTypeEnum } from "./message_type";

export default class Message {
    readonly idUser: string;
    readonly messageState: MessageState;
    readonly messageType: MessageType;
    /**Could be a message or a url to download resources */
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
        this.messageState = new MessageState(o.messageState);
        this.data = o.data;
    }

    public getMessage()
        : string {
        // How to open the emoji picker in mac (ctrl + cmd + space)
        // https://stackoverflow.com/a/36846969
        switch (this.messageType.type) {
            case MessageTypeEnum.Text:
                return this.data as string;
            case MessageTypeEnum.Image:
                return "Image 🏞";
            case MessageTypeEnum.Audio:
                return "Audio 🎧";
            default:
                return "You got a new message";
        }
    }

    static fromJSON(o: any): Message {
        return new Message(o);
    }
}