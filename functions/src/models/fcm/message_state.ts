/**
 * The possible values for the type in MessageState
 * 
 */
enum MessageStateEnum {
    Sent,
    Delivered,
    Seen
}

/**
 * The state of this message
 * */
class MessageState {

    readonly type: MessageStateEnum;

    /**
     * @param type - Type / state of the message
    */
    constructor(o: any) {
        this.type = o.type;
    }

    toJSON() {
        return {
            type: this.type,
        };
    }

    static fromJSON(o: any): MessageState {
        return new MessageState(o);
    }
}

export {
    MessageState as default,
    MessageStateEnum,
};