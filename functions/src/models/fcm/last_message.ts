import MessageState from "./message_state";
import MessageType from "./message_type";

export default class LastMessage {
    messageType: MessageType;
    messageState: MessageState;
    // TODO: Date as timestamp for firebase. Check the type of data
    date: any;
    message: string | undefined;
    acumalativeMsgs: number;

    constructor(o: any) {
        this.messageType = new MessageType(o.messageType);
        this.messageState = new MessageState(o.messageState);
        this.date = o.date;
        this.message = o.message;
        this.acumalativeMsgs = o?.acumalativeMsgs ?? 0;
    }

    static fromJSON(o: any): LastMessage {
        return new LastMessage(o);
    }

}