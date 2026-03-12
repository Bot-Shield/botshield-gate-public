/**
 * Example: Custom-branded gate verification page.
 *
 * Copy this file to worker/gateHtml.ts and customize the HTML/CSS
 * to match your brand. The function signature must stay the same.
 */

export function renderGatePage(host: string, returnTo: string, gateId: string): string {
  const verifyUrl =
    `https://app.botshield.ai/verify` +
    `?gate_id=${encodeURIComponent(gateId)}` +
    `&return_host=${encodeURIComponent(host)}` +
    `&return_to=${encodeURIComponent(returnTo)}`;

  const safeHost = host.replace(/[<>"'&]/g, '');

  // ──────────────────────────────────────────────────────────────────────
  // Customize everything below to match your brand.
  // The only requirement is that the verify link points to verifyUrl.
  // ──────────────────────────────────────────────────────────────────────

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify — ${safeHost}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box }
    body {
      /* Change background, font, and colors to match your brand */
      background: #f8f9fa;
      color: #1a1a1a;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 48px 40px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    /* Replace with your own logo */
    .logo { display: block; height: 48px; margin: 0 auto 24px }
    h1 { font-size: 20px; font-weight: 600; margin-bottom: 12px }
    p { color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 28px }
    .btn {
      display: inline-block;
      /* Change this to your brand color */
      background: #2563eb;
      color: #fff;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 8px;
      transition: opacity .15s;
    }
    .btn:hover { opacity: .9 }
    .footer { margin-top: 24px; font-size: 11px; color: #999 }
    .footer a { color: #999; text-decoration: none }
  </style>
</head>
<body>
  <div class="card">
    <!-- Replace with your logo URL -->
    <img class="logo" src="https://your-domain.com/logo.svg" alt="Your Brand">

    <h1>Quick verification required</h1>
    <p>
      We need to confirm you're human before continuing to
      <strong>${safeHost}</strong>. This takes just a moment.
    </p>

    <!-- This link MUST point to verifyUrl — do not change the href -->
    <a href="${verifyUrl}" class="btn">Verify Now</a>

    <div class="footer">
      Powered by <a href="https://botshield.ai" target="_blank">BotShield</a>
    </div>
  </div>
</body>
</html>`;
}
