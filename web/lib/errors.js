// Translates server error responses ({ error: <code>, message: <fallback> }).
//
// The API client (lib/api.js) runs outside React, so it can't call
// useTranslations directly. Instead a small bridge component registers a
// translator once the IntlProvider is mounted; fetchApi then resolves the
// localized message at throw time. Unknown codes fall back to the server's
// English `message`, so a missing translation never breaks the flow.

let translate = null;

export function setErrorTranslator(fn) {
    translate = fn;
}

export function resolveErrorMessage(body, status) {
    const code = body?.error;
    if (code && translate) {
        const localized = translate(code);
        if (localized) return localized;
    }
    return body?.message || `Request failed: ${status}`;
}
