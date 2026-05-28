function utf8ByteLength(value) {
  return Buffer.byteLength(String(value || ''), 'utf8');
}

module.exports = utf8ByteLength;
