# idm-signatures

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/idm-signatures
[downloads-image]:http://img.shields.io/npm/dm/idm-signatures.svg
[npm-image]:http://img.shields.io/npm/v/idm-signatures.svg
[travis-url]:https://travis-ci.org/ipfs-shipyard/js-idm-signatures
[travis-image]:http://img.shields.io/travis/ipfs-shipyard/js-idm-signatures/master.svg
[codecov-url]:https://codecov.io/gh/ipfs-shipyard/js-idm-signatures
[codecov-image]:https://img.shields.io/codecov/c/github/ipfs-shipyard/js-idm-signatures/master.svg
[david-dm-url]:https://david-dm.org/ipfs-shipyard/js-idm-signatures
[david-dm-image]:https://img.shields.io/david/ipfs-shipyard/js-idm-signatures.svg
[david-dm-dev-url]:https://david-dm.org/ipfs-shipyard/js-idm-signatures?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/ipfs-shipyard/js-idm-signatures.svg

Package to create and validate signatures made with IDM devices and sessions.


## Installation

```sh
$ npm install idm-signatures
```

This library is written in modern JavaScript and is published in both CommonJS and ES module transpiled variants. If you target older browsers please make sure to transpile accordingly.


## Motivation

Signatures in the DID ecosystem usually rely on [Linked Data Signatures](https://w3c-dvcg.github.io/ld-signatures/). We feel that the spec is still maturing and have the downside of not allowing to sign binary data directly. For those reasons and for the short-term, IDM relies on a signature scheme called `IdmSignature`.

A `IdmSignature` has the following shape:

```js
{
    didUrl: 'did:ipid:xxxxxx#public-key-id'
    keyPath: 'm',
    createdAt: 1560259756980,
    value: 'de43432daa....'
}
```

The `didUrl` references the DID and the (device) public key within the DID Document. The `keyPath` specifies the derivation path for the actual key used for signing, which may be `m` if it was the device key or `m/<number>` for a session key. The key derivation is based on [bip32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).

To verify that a signature is valid:

1. Fetch the DID Document associated with the `didUrl`
2. Check if the public key reference in the `didUrl` fragment is present there
3. Take the `publicExtendedKeyBase58` field of the public key and derive the child public key based on the `keyPath` (derivation path)
4. Check if the signature matches the data (as defined in [RFC 6979](https://tools.ietf.org/html/rfc6979) with the derived child public key


The `IdmSignature` scheme makes signatures compact as they don't contain the actual public key contents, even for signatures made with session keys. In the future, we will provide a binary format to make them even more compact.


## Usage

**Signer:**

```js
import { createSigner } from 'idm-signatures';

const didUrl = 'did:ipid:xxxxx#idm-device-yyyyy';
const privateKeyPem = '-----BEGIN EC PRIVATE KEY-----...';

const sign = createSigner(didUrl, privateKeyPem);

await (async () => {
    // Data may also be an ArrayBuffer or any TypedArray
    const data = { foo: 'bar' };

    const signature = await sign(data);

    console.log('signature', signature);
    // {
    //     didUrl: 'did:ipid:xxxxxx#public-key-id'
    //     keyPath: 'm',
    //     createdAt: 1560259756980,
    //     value: 'de43432daa....'
    // }
})();
```

**Verifier:**

```js
import resolveDid from 'did-resolver';
import { createVerifier } from 'idm-signatures';

const verify = createVerifier(resolveDid);

await (async () => {
    // Data may also be an ArrayBuffer or any TypedArray
    const data = { foo: 'bar' };
    const signature = {
        didUrl: 'did:ipid:xxxxxx#public-key-id'
        keyPath: 'm',
        createdAt: 1560259756980,
        value: 'de43432daa....'
    };

    const result = await verify(data, signature);

    console.log('result', result);
    // {
    //     valid: false // ...or true
    //     error: // contains the error explaining why signature is not valid
    // }
})();
```

## API

### createSigner(didUrl, privateKey, keyPath = 'm')

Creates a signer for the specified `didUrl` refering to a `DID + public key (secp256k1)`. The `privateKey` is the actual key that will be used to produce signatures, and `keyPath` is the BIP32 derivation path used to determine the `privateKey` (non hardened). The `privateKey` format may be any of the ones supported by [crypto-key-composer](https://github.com/ipfs-shipyard/js-crypto-key-composer#formats).

Returns a function that receives any `data` to be signed:

```js
async (data) => {};
```

When called, it returns a Promise to the `IdmSignature`.


### createVerifier(resolveDid)

Creates a verifier. The `resolveDid` is a function that takes a DID and resolves DID Documents:

```js
async (did) => {};
```

Returns a function that receives the `data` and the `signature` to be checked:

```js
async (data, signature) => {}
```

When called, it returns a Promise to an object with the following shape:

```js
{
    valid, // Boolean indicating if the signature is valid or not
    error // When invalid, contains the error explaining the reason why the signature is not valid
}
```

Note that the Promise will fail if any operation error occurs, such as if the DID Document was unable to be resolved. In these scenarios, the signature might either be valid or invalid.. it just happens that we were able to actually verify it.


## Tests

```sh
$ npm test
$ npm test -- --watch # during development
```


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
