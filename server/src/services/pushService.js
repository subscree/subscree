import { Expo } from 'expo-server-sdk';
import prisma from '../db/index.js';

const expo = new Expo();

export function isPushConfigured() {
    // Expo's public push service needs no API key; pushing is always possible.
    return true;
}

// Send a notification to every registered device of a user. Invalid tokens
// (DeviceNotRegistered) are pruned so we stop pushing to dead devices.
export async function sendPushToUser(userId, { title, body, data }) {
    const rows = await prisma.pushToken.findMany({ where: { userId } });
    const tokens = rows.map(r => r.token).filter(t => Expo.isExpoPushToken(t));
    if (!tokens.length) return;

    const messages = tokens.map(to => ({
        to,
        sound: 'default',
        title,
        body,
        data: data || {},
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
        try {
            const receipts = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...receipts);
        } catch (err) {
            console.error('[push] send chunk failed:', err.message);
        }
    }

    // Prune tokens Expo reports as no longer registered.
    const dead = [];
    tickets.forEach((ticket, i) => {
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            dead.push(messages[i].to);
        }
    });
    if (dead.length) {
        await prisma.pushToken.deleteMany({ where: { token: { in: dead } } });
    }
}
