import { NextRequest, NextResponse } from 'next/server';

// In-memory store for verification codes (TTL: 10 minutes)
const codeStore = new Map<string, { code: string; message: string; expires: number }>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanExpired() {
  const now = Date.now();
  Array.from(codeStore.entries()).forEach(([key, val]) => {
    if (val.expires < now) codeStore.delete(key);
  });
}

async function sendEmailWithResend(to: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Contact API] No RESEND_API_KEY set. Code for ${to}: ${code}`);
    return true; // Graceful fallback — still works without Resend configured
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: [to],
        subject: 'Your verification code',
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[Contact API] Resend error:', err);
    return false;
  }
}

async function sendContactEmail(senderEmail: string, message: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!apiKey || !contactEmail) {
    console.log(`[Contact API] Message from ${senderEmail}: ${message}`);
    return true; // Graceful fallback
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: [contactEmail],
        subject: `New message from ${senderEmail}`,
        html: `<p><strong>From:</strong> ${senderEmail}</p><p><strong>Message:</strong></p><p>${message}</p>`,
        reply_to: senderEmail,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[Contact API] Resend error:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  cleanExpired();

  try {
    const body = await request.json();
    const { action, email, message, code } = body;

    if (!action || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (action === 'send-code') {
      if (!message?.trim()) {
        return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
      }

      const verificationCode = generateCode();
      codeStore.set(email, {
        code: verificationCode,
        message: message.trim(),
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      });

      const sent = await sendEmailWithResend(email, verificationCode);
      if (!sent) {
        return NextResponse.json({ error: 'Failed to send verification code.' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Verification code sent.' });
    }

    if (action === 'verify') {
      if (!code?.trim()) {
        return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });
      }

      const stored = codeStore.get(email);
      if (!stored) {
        return NextResponse.json({ error: 'No pending verification. Please start over.' }, { status: 400 });
      }

      if (stored.expires < Date.now()) {
        codeStore.delete(email);
        return NextResponse.json({ error: 'Code expired. Please start over.' }, { status: 400 });
      }

      if (stored.code !== code.trim()) {
        return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
      }

      // Code valid — send the actual contact message
      codeStore.delete(email);
      const delivered = await sendContactEmail(email, stored.message);

      if (!delivered) {
        return NextResponse.json({ error: 'Failed to deliver message.' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Message delivered.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
