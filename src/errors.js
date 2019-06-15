class BaseError extends Error {
    constructor(message, code, props) {
        super(message);

        Object.assign(this, {
            ...props,
            code,
            name: this.constructor.name,
        });

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

export class InvalidSignatureError extends BaseError {
    constructor(message, props) {
        super(message, 'INVALID_SIGNATURE', props);
    }
}

export class InvalidSignatureShapeError extends BaseError {
    constructor(message, props) {
        super(message, 'INVALID_SIGNATURE_SHAPE', props);
    }
}

export class InvalidPrivateKey extends BaseError {
    constructor(message, props) {
        super(message, 'INVALID_PRIVATE_KEY', props);
    }
}

export class InvalidDidUrl extends BaseError {
    constructor(message, props) {
        super(message, 'INVALID_DID_URL', props);
    }
}
