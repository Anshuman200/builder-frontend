/**
 * End-to-End Encryption (E2EE) Utility
 * Uses only browser built-in SubtleCrypto (AES-GCM for data, AES-CBC for deterministic titles)
 */

const SALT = new TextEncoder().encode("pagecraft-v2-salt");
const ITERATIONS = 100000;

// Shared key for public templates (Gallery)
// The server still only see opaque blobs, but any user can decrypt a "Public" template.
const GALLERY_SECRET = "PAGECRAFT-PUBLIC-GALLERY-V1";

/**
 * Derives a CryptoKey from a raw password string
 */
export async function deriveKeyFromPassword(password: string, algo: "AES-GCM" | "AES-CBC"): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: SALT,
            iterations: ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: algo, length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Gets the current active session key from sessionStorage
 */
async function getSessionKey(algo: "AES-GCM" | "AES-CBC"): Promise<CryptoKey> {
    const pwd = sessionStorage.getItem("pagecraft_session_key");
    if (!pwd) {
        // Fallback to gallery secret if no session key exists (for public templates)
        return deriveKeyFromPassword(GALLERY_SECRET, algo);
    }
    return deriveKeyFromPassword(pwd, algo);
}

/**
 * Encrypts data using AES-GCM (Randomized)
 */
export async function encryptData(data: any, forceGallery = false): Promise<string> {
    if (!data) return "";
    const key = forceGallery
        ? await deriveKeyFromPassword(GALLERY_SECRET, "AES-GCM")
        : await getSessionKey("AES-GCM");

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));

    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
    );

    const buffer = new Uint8Array(encrypted);
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const contentHex = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');

    return `gcm:${ivHex}:${contentHex}`;
}

/**
 * Decrypts data using AES-GCM
 */
export async function decryptData(encryptedStr: string): Promise<any> {
    if (!encryptedStr || !encryptedStr.startsWith("gcm:")) return encryptedStr;

    try {
        const parts = encryptedStr.split(":");
        if (parts.length !== 3) return encryptedStr;

        const iv = new Uint8Array(parts[1].match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const content = new Uint8Array(parts[2].match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

        // Try session key first, then gallery key
        const keys = [
            await getSessionKey("AES-GCM"),
            await deriveKeyFromPassword(GALLERY_SECRET, "AES-GCM")
        ];

        for (const key of keys) {
            try {
                const decrypted = await window.crypto.subtle.decrypt(
                    { name: "AES-GCM", iv },
                    key,
                    content
                );
                return JSON.parse(new TextDecoder().decode(decrypted));
            } catch (e) {
                // Continue to next key
            }
        }
        return null;
    } catch (e) {
        console.error("Decryption failed", e);
        return null;
    }
}

/**
 * Encrypts data using AES-CBC with fixed IV (Deterministic)
 * Used for Titles to allow exact-match searching
 */
export async function encryptTitle(title: string): Promise<string> {
    if (!title) return "";
    const key = await getSessionKey("AES-CBC");
    const fixedIv = new Uint8Array(16).fill(42);
    const encoded = new TextEncoder().encode(title);

    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-CBC", iv: fixedIv },
        key,
        encoded
    );

    const buffer = new Uint8Array(encrypted);
    const hex = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
    return `det:${hex}`;
}

export async function decryptTitle(encryptedStr: string): Promise<string> {
    if (!encryptedStr || !encryptedStr.startsWith("det:")) return encryptedStr;

    try {
        const encryptedText = encryptedStr.slice(4);
        const content = new Uint8Array(encryptedText.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

        const keys = [
            await getSessionKey("AES-CBC"),
            await deriveKeyFromPassword(GALLERY_SECRET, "AES-CBC")
        ];

        const fixedIv = new Uint8Array(16).fill(42);

        for (const key of keys) {
            try {
                const decrypted = await window.crypto.subtle.decrypt(
                    { name: "AES-CBC", iv: fixedIv },
                    key,
                    content
                );
                return new TextDecoder().decode(decrypted);
            } catch { }
        }
        return encryptedStr;
    } catch (e) {
        return encryptedStr;
    }
}

/**
 * Encrypts a full page object into an opaque blob + search indexes.
 */
export async function encryptFullPage(page: any): Promise<any> {
    const { _id, author, createdAt, updatedAt, ...privateData } = page;

    // Determine if this should be encrypted with the Gallery key
    const isPublic = !!page.isPublic || !!page.isTemplate;

    // 1. Generate Opaque Blob (GCM)
    const encryptedData = await encryptData(privateData, isPublic);

    // 2. Generate Search Indexes (Deterministic CBC)
    // Always use session key for search indexes to keep personal dashboard private
    const searchTitle = await encryptTitle(page.title || "Untitled Page");
    const searchSlug = await encryptTitle(page.slug || "untitled-page");

    return {
        _id,
        author,
        encryptedData,
        searchTitle,
        searchSlug,
        createdAt,
        updatedAt
    };
}

/**
 * Decrypts an opaque page blob back into a full page object.
 */
export async function decryptFullPage(encryptedPage: any): Promise<any> {
    if (!encryptedPage.encryptedData) {
        // Fallback for legacy records
        return {
            ...encryptedPage,
            title: await decryptTitle(encryptedPage.title),
            content: await decryptData(encryptedPage.content),
            meta: await decryptData(encryptedPage.meta)
        };
    }

    try {
        const privateData = await decryptData(encryptedPage.encryptedData);
        if (!privateData) throw new Error("Could not decrypt blob");

        return {
            ...encryptedPage,
            ...privateData,
            title: privateData.title || await decryptTitle(encryptedPage.searchTitle),
            slug: privateData.slug || await decryptTitle(encryptedPage.searchSlug)
        };
    } catch (e) {
        console.error("Full page decryption failed", e);
        // Return with placeholder title if decryption fails (e.g. locked session)
        return {
            ...encryptedPage,
            title: "Locked Project 🔒",
            isLocked: true
        };
    }
}
