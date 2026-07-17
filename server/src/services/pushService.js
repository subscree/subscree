import { Expo } from 'expo-server-sdk';
import prisma from '../db/index.js';

const expo = new Expo();

export function isPushConfigured() {
    // Expo's public push service needs no API key; pushing is always possible.
    return true;
}

// Send one chunk, pairing each ticket back up with the token it belongs to
// (index-aligned, so pruning below stays correct even when a chunk gets
// split and retried). If the chunk mixes tokens from more than one Expo
// project — e.g. a stale token left over from before this app's EAS project
// was renamed — Expo rejects the whole batch with PUSH_TOO_MANY_EXPERIENCE_IDS
// instead of processing any of it; split by the experience id groups it
// reports and retry each on its own so one stale token can't block everyone.
async function sendChunk(chunk) {
    try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        return chunk.map((m, i) => ({ token: m.to, ticket: tickets[i] }));
    } catch (err) {
        if (err.code === 'PUSH_TOO_MANY_EXPERIENCE_IDS' && err.details) {
            const results = [];
            for (const tokensForExperience of Object.values(err.details)) {
                const subChunk = chunk.filter(m => tokensForExperience.includes(m.to));
                results.push(...await sendChunk(subChunk));
            }
            return results;
        }
        console.error('[push] send chunk failed:', err.message);
        return [];
    }
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

    const results = [];
    for (const chunk of expo.chunkPushNotifications(messages)) {
        results.push(...await sendChunk(chunk));
    }

    // Prune tokens Expo reports as no longer registered.
    const dead = results
        .filter(r => r.ticket?.status === 'error' && r.ticket.details?.error === 'DeviceNotRegistered')
        .map(r => r.token);
    if (dead.length) {
        await prisma.pushToken.deleteMany({ where: { token: { in: dead } } });
    }
}
