const hash = async (input, algorithm) => {
    const digest = await crypto.subtle.digest(algorithm, input);

    return new Uint8Array(digest);
};

export const SHA1 = 'SHA-1';
export const SHA256 = 'SHA-256';
export const SHA384 = 'SHA-384';
export const SHA512 = 'SHA-512';

export default hash;
