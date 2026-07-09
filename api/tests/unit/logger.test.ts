import { describe, it, expect } from 'vitest';
import { Writable } from 'node:stream';
import { createLogger } from '../../src/utils/logger.js';

function captureStream(lines: string[]) {
  return new Writable({
    write(chunk, _enc, cb) {
      lines.push(chunk.toString());
      cb();
    },
  });
}

describe('logger', () => {
  it('redacts authorization headers and password fields', () => {
    const lines: string[] = [];
    const log = createLogger(captureStream(lines));
    log.info(
      { req: { headers: { authorization: 'Bearer sekrit' } }, password: 'hunter2' },
      'login attempt',
    );
    const out = lines.join('');
    expect(out).not.toContain('sekrit');
    expect(out).not.toContain('hunter2');
    expect(out).toContain('[Redacted]');
  });

  it('emits structured JSON with the message', () => {
    const lines: string[] = [];
    const log = createLogger(captureStream(lines));
    log.info({ requestId: 'abc-123' }, 'hello');
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.msg).toBe('hello');
    expect(parsed.requestId).toBe('abc-123');
  });
});
