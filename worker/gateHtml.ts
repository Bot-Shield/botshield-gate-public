/**
 * Renders the BotShield gate verification page.
 * Shown to visitors who don't have a valid session cookie.
 *
 * Customize this file to match your brand — change colors, logo, copy, etc.
 */

export function renderGatePage(host: string, returnTo: string, gateId: string): string {
  // Sanitize host for safe HTML insertion
  const safeHost = host.replace(/[<>"'&]/g, '');

  const hasMissingParams = !gateId;

  const verifyUrl = hasMissingParams
    ? '#'
    : `https://app.botshield.ai/verify` +
      `?gate_id=${encodeURIComponent(gateId)}` +
      `&return_host=${encodeURIComponent(host)}` +
      `&return_to=${encodeURIComponent(returnTo)}`;

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
      padding:16px;
    }
    .card{
      background:#101010;
      border:1px solid rgba(255,255,255,0.06);
      border-radius:16px;
      box-shadow:0 4px 24px rgba(0,0,0,0.4);
      padding:40px 36px 36px;
      max-width:460px;width:100%;
      text-align:center;
    }
    .badge{
      display:inline-block;
      background:rgba(20,123,170,0.1);
      border:1px solid rgba(20,123,170,0.2);
      color:#6bb6da;
      font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
      padding:4px 12px;border-radius:20px;margin-bottom:20px;
    }
    .badge.error{
      background:rgba(239,68,68,0.1);
      border-color:rgba(239,68,68,0.2);
      color:#fca5a5;
    }
    h1{font-size:24px;font-weight:600;line-height:32px;margin-bottom:20px}
    p{color:#c7c7c7;font-size:15px;line-height:22px;margin-bottom:32px}
    .btn{
      background:linear-gradient(180deg,#147baa 0%,#0f5e82 100%);
      color:#fff;text-decoration:none;
      font-size:14px;font-weight:500;height:44px;
      display:flex;align-items:center;justify-content:center;
      border-radius:9px;
      box-shadow:0 9px 13px rgba(0,0,0,0.1),0 4px 5px rgba(0,0,0,0.1);
      transition:opacity .15s;
    }
    .btn:hover{opacity:.88}
    .btn.disabled{
      opacity:.35;pointer-events:none;cursor:not-allowed;
    }
    .footer{margin-top:28px;font-size:12px;color:#555}
    .footer a{color:#555;text-decoration:none}
    .footer a:hover{color:#888}
    @media(max-width:400px){
      .card{padding:24px 28px;max-width:320px}
      h1{font-size:20px}
    }
  </style>
  ${hasMissingParams ? `<script>console.error('[BotShield Gate] Missing gate_id — gate not resolved for host: ${safeHost}. Verify the gate is configured and active for this domain.');</script>` : ''}
</head>
<body>
  <div class="card">
    <div class="badge${hasMissingParams ? ' error' : ''}">
      ${hasMissingParams ? 'Configuration Error' : 'BotShield Protection Active'}
    </div>
    <h1>${hasMissingParams ? 'Gate not configured' : 'Verify your presence to continue'}</h1>
    <p>${hasMissingParams
        ? 'BotShield protection is not configured for this domain. Contact the site administrator.'
        : 'This site requires human verification before continuing.'}</p>
    <a href="${verifyUrl}" class="btn${hasMissingParams ? ' disabled' : ''}">Verify to Continue</a>
    <div class="footer">
      Powered by <a href="https://botshield.ai" target="_blank">BotShield</a>
      &nbsp;&middot;&nbsp;No data collected
    </div>
  </div>
</body>
</html>`;
}
