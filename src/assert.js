import { parse as parseDid } from 'did-uri';
import { isPlainObject } from 'lodash';
import { InvalidDidUrl, InvalidSignatureShapeError, InvalidPrivateKey } from './errors';

export const assertIdmSignatureShape = (signature) => {
    if (!isPlainObject(signature)) {
        throw new InvalidSignatureShapeError('Expecting signature to be an object', { signature });
    }

    if (typeof signature.createdAt !== 'number') {
        throw new InvalidSignatureShapeError('Expecting createdAt to be a number', { signature });
    }

    if (typeof signature.value !== 'string') {
        throw new InvalidSignatureShapeError('Expecting value to be a string', { signature });
    }

    if (typeof signature.didUrl !== 'string') {
        throw new InvalidSignatureShapeError('Expecting value to be a string', { signature });
    }

    if (typeof signature.keyPath !== 'string') {
        throw new InvalidSignatureShapeError('Expecting keyPath to be a string', { signature });
    }
};

export const assertDidUrl = (didUrl) => {
    if (typeof didUrl !== 'string') {
        throw new InvalidDidUrl('Expecting didUrl to be a string', { didUrl });
    }

    let spec;

    try {
        spec = parseDid(didUrl);
    } catch (err) {
        throw new InvalidDidUrl(err.message, { didUrl });
    }

    if (!spec.fragment) {
        throw new InvalidDidUrl('Expecting didUrl to contain the public key via the fragment', { didUrl });
    }
};

export const assertKeyAlgorithm = (keyAlgorithm) => {
    if (keyAlgorithm.id !== 'ec-public-key') {
        throw new InvalidPrivateKey('Expecting private key to be an EC key', { keyAlgorithm });
    }

    if (keyAlgorithm.namedCurve !== 'secp256k1') {
        throw new InvalidPrivateKey('Expecting EC private key curve to be secp256k1', { keyAlgorithm });
    }
};
