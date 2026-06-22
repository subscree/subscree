import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import prisma from '../db/index.js';
import { CURRENCY_CODES } from '../constants/currencies.js';

const UserRouter = express.Router();
UserRouter.use(AuthMiddleware);

const profileSchema = z.object({
    name:              z.string().min(1, 'Name is required').max(100).optional(),
    preferredCurrency: z.enum(CURRENCY_CODES, { error: 'Invalid currency code' }).optional(),
    notifyEnabled:         z.boolean().optional(),
    notifyMode:            z.enum(['PER_SUBSCRIPTION', 'DIGEST']).optional(),
    notifyDaysBefore:      z.number().int().min(1).max(60).optional(),
    notifyDigestFrequency: z.enum(['WEEKLY', 'MONTHLY']).optional(),
    pushEnabled:           z.boolean().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
});

const pushTokenSchema = z.object({
    token:    z.string().min(1, 'Token is required'),
    platform: z.string().max(20).optional(),
});

function safeUser(user) {
    return {
        id:                    user.id,
        email:                 user.email,
        name:                  user.name,
        preferredCurrency:     user.preferredCurrency,
        notifyEnabled:         user.notifyEnabled,
        notifyMode:            user.notifyMode,
        notifyDaysBefore:      user.notifyDaysBefore,
        notifyDigestFrequency: user.notifyDigestFrequency,
        pushEnabled:           user.pushEnabled,
    };
}

UserRouter.get('/me', async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user: safeUser(user) });
    } catch (err) {
        next(err);
    }
});

UserRouter.patch('/me', async (req, res, next) => {
    const result = profileSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }

    try {
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: result.data,
        });
        res.json({ message: 'Profile updated', user: safeUser(user) });
    } catch (err) {
        next(err);
    }
});

UserRouter.patch('/me/password', async (req, res, next) => {
    const result = passwordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { currentPassword, newPassword } = result.data;

    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const valid = bcrypt.compareSync(currentPassword, user.passwordHash);
        if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

        const passwordHash = bcrypt.hashSync(newPassword, 10);
        await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
});

// --- Push tokens ---------------------------------------------------------

// Register (or refresh) this device's Expo push token and enable push.
UserRouter.post('/me/push-tokens', async (req, res, next) => {
    const result = pushTokenSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }
    const { token, platform } = result.data;
    try {
        await prisma.pushToken.upsert({
            where:  { token },
            update: { userId: req.userId, platform },
            create: { userId: req.userId, token, platform },
        });
        await prisma.user.update({ where: { id: req.userId }, data: { pushEnabled: true } });
        res.status(201).json({ message: 'Push token registered' });
    } catch (err) {
        next(err);
    }
});

// Remove this device's token. Disables push once the user has no devices left.
UserRouter.delete('/me/push-tokens', async (req, res, next) => {
    const result = pushTokenSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }
    try {
        await prisma.pushToken.deleteMany({ where: { token: result.data.token, userId: req.userId } });
        const remaining = await prisma.pushToken.count({ where: { userId: req.userId } });
        if (remaining === 0) {
            await prisma.user.update({ where: { id: req.userId }, data: { pushEnabled: false } });
        }
        res.json({ message: 'Push token removed' });
    } catch (err) {
        next(err);
    }
});

// --- Notification center -------------------------------------------------

UserRouter.get('/me/notifications', async (req, res, next) => {
    try {
        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where:   { userId: req.userId },
                orderBy: { createdAt: 'desc' },
                take:    50,
            }),
            prisma.notification.count({ where: { userId: req.userId, readAt: null } }),
        ]);
        res.json({ notifications, unreadCount });
    } catch (err) {
        next(err);
    }
});

// Mark notifications read — a specific set if `ids` is given, otherwise all.
UserRouter.post('/me/notifications/read', async (req, res, next) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
    try {
        await prisma.notification.updateMany({
            where: { userId: req.userId, readAt: null, ...(ids ? { id: { in: ids } } : {}) },
            data:  { readAt: new Date() },
        });
        res.json({ message: 'Marked read' });
    } catch (err) {
        next(err);
    }
});

export default UserRouter;
