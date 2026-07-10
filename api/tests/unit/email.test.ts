import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email_123' }, error: null });
vi.mock('resend', () => {
  return {
    Resend: class {
      constructor() {}
      emails = { send: sendMock };
    },
  };
});

beforeEach(() => {
  sendMock.mockClear();
});

describe('sendOtpEmail', () => {
  it('sends via Resend when RESEND_API_KEY is configured', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('RESEND_FROM_ADDRESS', 'noreply@frugal.dev');
    vi.resetModules();
    const { sendOtpEmail } = await import('../../src/utils/email.js');

    await sendOtpEmail({ to: 'user@example.com', otp: '123456', purpose: 'email-verification' });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@frugal.dev',
        to: 'user@example.com',
      }),
    );
    const call = sendMock.mock.calls[0]![0] as { subject: string; text: string };
    expect(call.text).toContain('123456');
    vi.unstubAllEnvs();
  });

  it('skips sending and does not throw when RESEND_API_KEY is unset', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.resetModules();
    const { sendOtpEmail } = await import('../../src/utils/email.js');

    await expect(
      sendOtpEmail({ to: 'user@example.com', otp: '654321', purpose: 'sign-in' }),
    ).resolves.toBeUndefined();
    expect(sendMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});
