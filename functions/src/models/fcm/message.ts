import { getRandomInt } from "../../utils/utils";
import MessageState, { MessageStateEnum } from "./message_state";
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


    toJSON() {
        return {
            idUser: this.idUser,
            messageType: this.messageType.toJSON(),
            messageState: this.messageState.toJSON(),
            data: this.data,
        };
    }

    /**
     * 
     * Return a readable message for notification
     * 
     */
    getMessage()
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

    //https://stackoverflow.com/a/42108988/10942018 Named paremters

    static forTesting(id: string, data: string | undefined = undefined,) {

        const words = ["Hello", "Whow are you?", "Wasyp", 'Thatss ok', ":D"];

        const types = [MessageTypeEnum.Text, MessageTypeEnum.Image, MessageTypeEnum.Audio];

        const states = [MessageStateEnum.Sent, MessageStateEnum.Seen, MessageStateEnum.Delivered];

        if (!data)
            data = words[getRandomInt(words.length)];

        return new Message({
            idUser: id,
            messageType: {
                type: types[getRandomInt(types.length)],
            },
            messageState: {
                type: states[getRandomInt(states.length)],
            },
            data: data,
        });
    }


}