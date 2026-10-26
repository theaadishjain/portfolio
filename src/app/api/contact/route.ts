import { NextRequest, NextResponse } from 'next/server';

const MAX_MESSAGE = 5000;
const MAX_EMAIL = 254; // RFC 5321 maximum

// Deliberately strict, and no \r or \n can survive it — the address is placed
// into mail headers (From display name, Reply-To), where a newline would let a
// sender inject headers of their own.
const EMAIL_RE = /^[^\s@<>"'\\]{1,64}@[^\s@<>"'\\.]+(\.[^\s@<>"'\\.]+)+$/;

// Best-effort abuse brake. A serverless deploy runs several instances and each
// keeps its own copy, so this is a speed bump rather than a guarantee — the
// real ceiling is the Resend account quota. It is not used for correctness:
// nothing about delivering a message depends on this surviving.
const RATE_LIMIT = 5;
const RATE_WINDOW = 10 * 60 * 1000; // 10 minutes
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    Array.from(hits.entries()).forEach(([key, times]) => {
      if (times.every((t) => now - t >= RATE_WINDOW)) hits.delete(key);
    });
  }
  return false;
}

// The message is visitor-controlled and lands in an HTML email, so every
// special character has to be neutralised before interpolation.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    // Honeypot: a real person never sees this field, so anything in it is a bot.
    // Answer 200 so the bot has no signal that it was caught.
    const honeypot = typeof body.website === 'string' ? body.website : '';

    if (honeypot) {
      return NextResponse.json({ success: true, message: 'Message sent.' });
    }

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are both required.' }, { status: 400 });
    }
    if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { error: `Message is too long (max ${MAX_MESSAGE} characters).` },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again later.' },
        { status: 429 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;

    if (!apiKey || !contactEmail) {
      // Local development without credentials. This path must never run in
      // production, so it reports the failure instead of faking success.
      console.warn(
        `[Contact API] RESEND_API_KEY or CONTACT_EMAIL missing — not sent.\n  from: ${email}\n  message: ${message}`,
      );
      return NextResponse.json(
        { error: 'Email is not configured on the server.' },
        { status: 503 },
      );
    }

    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // The address must stay one you control — SPF/DKIM/DMARC exist to stop
        // anyone sending as someone else. Only the display name carries the
        // visitor's address, and reply_to makes Reply go to them.
        from: `${email} via portfolio <onboarding@resend.dev>`,
        to: [contactEmail],
        reply_to: email,
        subject: `Portfolio message from ${email}`,
        text: `From: ${email}\n\n${message}`,
        html:
          `<p><strong>From:</strong> ${safeEmail}</p>` +
          `<hr /><p>${safeMessage}</p>`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[Contact API] Resend responded ${res.status}: ${detail}`);
      return NextResponse.json(
        { error: 'Could not send the message. Please try again.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, message: 'Message sent.' });
  } catch (err) {
    console.error('[Contact API]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
