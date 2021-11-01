import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
/// Create this file with your Agora Credentials
import { APP_CERTIFICATE, APP_ID } from '../utils/keys';

/**
 * Generate a token for a channel
 * 
 * @returns {Object{ token: string; channel: string}} Returns the token and the channel created with the data given
 */
function createTokenandChannel(): { token: string; channel: string } {

    const channel = _generateChannel();
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expireTime = 3600;

    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channel, uid, role, privilegeExpireTime,);

    return { channel, token }
}

function _generateChannel(): string {
    const prefix = 'channel';
    const date = Date.now();
    return `${prefix}_${date}`;
}

export default createTokenandChannel