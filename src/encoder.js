import cbor from 'borc';

const encodeData = (data) => {
    // Support array buffer or any typed array
    if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
        return new Uint8Array(data);
    }

    // Use CBOR as fallback
    const buffer = cbor.encode(data);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    return arrayBuffer;
};

export default encodeData;
