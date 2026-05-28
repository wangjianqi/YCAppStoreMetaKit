const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const utf8ByteLength = require('../src/core/byteLength');

describe('byteLength', () => {
  it('returns 0 for empty string', () => {
    assert.equal(utf8ByteLength(''), 0);
  });

  it('returns correct byte length for ASCII', () => {
    assert.equal(utf8ByteLength('hello'), 5);
  });

  it('returns correct byte length for CJK characters', () => {
    assert.equal(utf8ByteLength('中文'), 6);
  });

  it('returns correct byte length for emoji', () => {
    assert.equal(utf8ByteLength('🎉'), 4);
  });

  it('handles null and undefined', () => {
    assert.equal(utf8ByteLength(null), 0);
    assert.equal(utf8ByteLength(undefined), 0);
  });

  it('handles numbers', () => {
    assert.equal(utf8ByteLength(123), 3);
  });

  it('handles mixed content', () => {
    const input = 'task list,daily planner,notes';
    assert.equal(utf8ByteLength(input), Buffer.byteLength(input, 'utf8'));
  });
});
