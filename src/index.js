import secp256k1 from 'secp256k1';
import { Buffer } from 'buffer';
import { parse as parseDid } from 'did-uri';
import { decomposePrivateKey } from 'crypto-key-composer';
import HDKey from 'hdkey';
import { InvalidSignatureError } from './errors';
import { assertDidUrl, assertIdmSignatureShape, assertKeyAlgorithm } from './assert';
import encodeData from './encoder';
import hasher, { SHA256 } from './hasher';

export const createSigner = (didUrl, privateKey, keyPath = 'm') => {
    assertDidUrl(didUrl);

    const decomposedKey = decomposePrivateKey(privateKey, { format: ['raw-pem', 'raw-der', 'pkcs8-pem', 'pkcs8-der'] });

    assertKeyAlgorithm(decomposedKey.keyAlgorithm);

    const secp256k1PrivateKey = Buffer.from(decomposedKey.keyData.d);

    return async (data) => {
        const encodedData = encodeData(data);
        const hashedData = await hasher(encodedData, SHA256);
        const message = Buffer.from(hashedData);

        const sig = secp256k1.sign(message, secp256k1PrivateKey);
        const sigDer = secp256k1.signatureExport(sig.signature);
        const sigBase64 = sigDer.toString('base64');

        const idmSignature = {
            didUrl,
            keyPath,
            value: sigBase64,
            createdAt: Date.now(),
        };

        return idmSignature;
    };
};

export const createVerifier = (resolveDid) => async (data, idmSignature) => {
    try {
        assertIdmSignatureShape(idmSignature);
        assertDidUrl(idmSignature.didUrl);
    } catch (err) {
        return {
            valid: false,
            error: new InvalidSignatureError(err.message),
        };
    }

    const { didUrl, keyPath, value } = idmSignature;

    const { did } = parseDid(didUrl);
    const didDocument = await resolveDid(did);

    const didPublicKey = didDocument.publicKey &&
            didDocument.publicKey.find((publicKey) => publicKey.id === didUrl);

    if (!didPublicKey) {
        return {
            valid: false,
            error: new InvalidSignatureError(`The publicKey "${didUrl}" was not found within the DID Document`, { did, didDocument }),
        };
    }
    if (!didPublicKey.publicExtendedKeyBase58) {
        return {
            valid: false,
            error: new InvalidSignatureError(`The publicKey "${didUrl}" was found in the DID Document but is missing publicKeyPem or publicExtendedKeyBase58 properties`, { didPublicKey }),
        };
    }

    const encodedData = encodeData(data);
    const hashedData = await hasher(encodedData, SHA256);
    const message = Buffer.from(hashedData);

    const sigDer = Buffer.from(value, 'base64');
    const sig = secp256k1.signatureImport(sigDer);

    const hdkey = HDKey.fromExtendedKey(didPublicKey.publicExtendedKeyBase58);
    const childHdkey = hdkey.derive(keyPath);
    const secp256k1PublicKey = childHdkey.publicKey;

    const valid = secp256k1.verify(message, sig, secp256k1PublicKey);

    if (!valid) {
        return {
            valid: false,
            error: new InvalidSignatureError('Signature mismatch'),
        };
    }

    return { valid: true };
};
