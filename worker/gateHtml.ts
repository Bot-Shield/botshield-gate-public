/**
 * Renders the BotShield gate verification page.
 * Shown to visitors who don't have a valid session cookie.
 *
 * Customize this file to match your brand — change colors, logo, copy, etc.
 */

export function renderGatePage(host: string, returnTo: string, gateId: string): string {
  const verifyUrl =
    `https://app.botshield.ai/verify` +
    `?gate_id=${encodeURIComponent(gateId)}` +
    `&return_host=${encodeURIComponent(host)}` +
    `&return_to=${encodeURIComponent(returnTo)}`;

  // Sanitize host for safe HTML insertion
  const safeHost = host.replace(/[<>"'&]/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Required — ${safeHost}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      background:#000;color:#fff;
      font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;
      min-height:100vh;display:flex;align-items:center;justify-content:center;
    }
    .card{
      background:#0e0e0e;border:1px solid #303030;border-radius:16px;
      padding:48px 40px;max-width:440px;width:90%;text-align:center;
    }
    .logo{display:block;height:64px;margin:0 auto 24px}
    .badge{
      display:inline-block;background:#0d2235;
      border:1px solid rgba(20,123,170,0.25);color:#147baa;
      font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
      padding:4px 12px;border-radius:20px;margin-bottom:20px;
    }
    h1{font-size:22px;font-weight:700;line-height:1.3;margin-bottom:10px}
    .host{color:#147baa}
    p{color:#666;font-size:14px;line-height:1.6;margin-bottom:32px}
    .btn{
      display:block;background:#147baa;color:#fff;text-decoration:none;
      font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;
      transition:opacity .15s;
    }
    .btn:hover{opacity:.88}
    .footer{margin-top:28px;font-size:12px;color:#444}
    .footer a{color:#555;text-decoration:none}
    .footer a:hover{color:#888}
  </style>
</head>
<body>
  <div class="card">
    <!--
      Replace the logo URL below with your own if you want custom branding.
      You can also serve it from the Worker itself using a static asset binding.
    -->
    <img class="logo" src="https://app.botshield.ai/public/botshield-logo-main-lg.svg" alt="BotShield">
    <div class="badge">Bot Protection Active</div>
    <h1>Verify your presence to continue to <span class="host">${safeHost}</span></h1>
    <p>
      <strong>${safeHost}</strong> is protected by BotShield.<br>
      Complete a quick biometric check — no passwords, no tracking.
    </p>
    <a href="${verifyUrl}" class="btn">Verify Presence</a>
    <div class="footer">
      Protected by <a href="https://botshield.ai" target="_blank">BotShield</a>
      &nbsp;&middot;&nbsp;No personal data collected
    </div>
  </div>
</body>
</html>`;
}
