import { createSigner, createVerifier } from '../src';

it('should export createSigner', async () => {
    expect(typeof createSigner).toBe('function');
});

it('should export createVerifier', async () => {
    expect(typeof createVerifier).toBe('function');
});
