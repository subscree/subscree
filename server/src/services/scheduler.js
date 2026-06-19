import { runDueNotifications } from './notificationService.js';
import { isEmailConfigured } from './emailService.js';

// Poll interval for the notification dispatcher. Per-occurrence dedupe makes
// frequent runs harmless; default is hourly.
const INTERVAL_MS = Number(process.env.NOTIFY_INTERVAL_MS) || 60 * 60 * 1000;

let timer = null;

export function startScheduler() {
    if (timer) return;
    if (!isEmailConfigured()) {
        console.log('[scheduler] no email provider configured — notification scheduler disabled');
        return;
    }

    const tick = () => {
        runDueNotifications().catch(err =>
            console.error('[scheduler] notification run failed:', err.message));
    };

    // Run shortly after boot, then on the interval.
    timer = setInterval(tick, INTERVAL_MS);
    setTimeout(tick, 10 * 1000);
    console.log(`[scheduler] notification scheduler started (every ${Math.round(INTERVAL_MS / 1000)}s)`);
}

export function stopScheduler() {
    if (timer) { clearInterval(timer); timer = null; }
}
