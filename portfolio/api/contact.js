// api/contact.js — Vercel Serverless Function

module.exports = async function handler(req, res) {

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message, phone } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Resend Email
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: [process.env.CONTACT_EMAIL || '7roman.khan123@gmail.com'],
        subject: `Portfolio: ${subject || 'New Message'} — from ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#6366f1;margin-bottom:20px;">New Portfolio Message</h2>
            <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">
              <tr style="background:#f9f9f9;">
                <td style="padding:12px;color:#666;font-weight:600;width:120px;">Name</td>
                <td style="padding:12px;font-weight:700;">${name}</td>
              </tr>
              <tr>
                <td style="padding:12px;color:#666;font-weight:600;">Email</td>
                <td style="padding:12px;">${email}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px;color:#666;font-weight:600;">Phone</td>
                <td style="padding:12px;">${phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding:12px;color:#666;font-weight:600;">Subject</td>
                <td style="padding:12px;">${subject || 'N/A'}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px;color:#666;font-weight:600;vertical-align:top;">Message</td>
                <td style="padding:12px;white-space:pre-line;">${message}</td>
              </tr>
            </table>
            <p style="color:#999;font-size:12px;margin-top:16px;">Sent from your portfolio · ${new Date().toLocaleString()}</p>
          </div>
        `,
        reply_to: email,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send. Check RESEND_API_KEY.' });
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error. Try again later.' });
  }
}
