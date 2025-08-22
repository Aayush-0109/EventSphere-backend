import redis from "../config/redis.js"

const CH = {
    notifications: 'eb:chan:notifications',
    admin: 'eb:chan:admin_notifications'
};

function withMeta(data) {
    return {
        ...(data || {}),
        timestamp: new Date().toISOString()
    }
}

class RealtimePublisher {
    constructor(client) {
        this.client = client
    }
    async _publish(channel, payload) {
        if (!this.client) throw new Error('Redis client not available');
        const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
        return this.client.publish(channel, msg);
    }
    async publishToAll(event, data) {
        return this._publish(CH.notifications, {
            event,
            data: withMeta(data),
            target: { type: 'all' }
        })

    }
    async publishToRole(role, event, data) {
        return this._publish(CH.notifications, {
            event,
            data: withMeta(data),
            target: { type: 'role', role }
        });
    }

    async publishToUser(userId, event, data) {
        return this._publish(CH.notifications, {
            event,
            data: withMeta(data),
            target: { type: 'user', userId: Number(userId) }
        });
    }

    async publishToEvent(eventId, event, data) {
        return this._publish(CH.notifications, {
            event,
            data: withMeta(data),
            target: { type: 'event', eventId: Number(eventId) }
        });
    }

    async publishAdmin(event, data) {
        return this._publish(CH.admin, {
            event,
            data: withMeta(data)
        });
    }
}
const realtime = new RealtimePublisher(redis);
export default realtime