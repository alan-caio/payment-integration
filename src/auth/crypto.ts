import crypto from 'crypto';

const algorithm = 'aes-256-ctr';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, this.config.secret, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  const ivString = iv.toString('hex');
  const encryptedString = encrypted.toString('hex');

  const result = `${ivString}${encryptedString}`;
  return result;
}

function decrypt(hash) {
  const iv = hash.slice(0, 32);
  const content = hash.slice(32);

  const decipher = crypto.createDecipheriv(algorithm, this.config.secret, Buffer.from(iv, 'hex'));

  const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);

  const result = decrypted.toString();
  return result;
}

export default {
  encrypt,
  decrypt,
};
