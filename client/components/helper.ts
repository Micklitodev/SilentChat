const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getSalt(groupName: string) {
    const data = encoder.encode('silentchat-salt-' + groupName);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hash);
}

export async function deriveKey(password: string, groupName: string): Promise<CryptoKey> {
    const salt = await getSalt(groupName);
    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

function toBase64(buf: ArrayBuffer) {
    // @ts-ignore
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function fromBase64(str: string) {
    return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

export async function encryptMessage(key: CryptoKey, plaintext: string) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext));
    return { iv: toBase64(iv.buffer), data: toBase64(ciphertext) };
}

export async function decryptMessage(key: CryptoKey, payload: { iv: string; data: string }) {
    try {
        const iv = fromBase64(payload.iv);
        const data = fromBase64(payload.data);
        const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
        return decoder.decode(plainBuf);
    } catch {
        return '[unable to decrypt — wrong room password?]';
    }
}