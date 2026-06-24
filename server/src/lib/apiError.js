// Standard error response shape: a stable machine-readable `error` code plus an
// English `message` fallback. Clients translate the code via their i18n
// catalogs (namespace "Errors") and fall back to `message` when a code is
// unknown — so adding a new error never blocks on client translations.

export function sendError(res, status, code, message) {
    return res.status(status).json({ error: code, message });
}

// Maps a Zod issue's kind to a coarse rule suffix used in the error code.
const ZOD_RULE = {
    too_small:      'MIN',
    too_big:        'MAX',
    invalid_type:   'TYPE',
    invalid_format: 'FORMAT',
    invalid_value:  'ENUM',
};

// Turns the first Zod issue into a `VALIDATION_<FIELD>_<RULE>` code (e.g.
// VALIDATION_PASSWORD_MIN, VALIDATION_EMAIL_FORMAT), keeping the schema's
// English message as the fallback. Always responds 400.
export function validationError(res, result) {
    const issue = result.error.issues[0];
    const field = String(issue.path?.[0] ?? 'FIELD').toUpperCase();
    const rule  = ZOD_RULE[issue.code] ?? 'INVALID';
    return sendError(res, 400, `VALIDATION_${field}_${rule}`, issue.message);
}
