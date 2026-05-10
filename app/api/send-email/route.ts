import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const body = await req.json()
    const { type, donor } = body

    if (!donor?.email) {
      return NextResponse.json({ error: 'Donor email required' }, { status: 400 })
    }

    // Determine dashboard URL and content by tier
    const tier = donor.tier || '1000'
    const isCommuntiy = tier === '100' || tier === '250'
    const isMiyawaki = tier === '5000'
    const isJoint = tier === '500'
    const dashboardPath = donor.dashboard || (isCommuntiy ? '/community-dashboard' : isMiyawaki ? '/miyawaki-dashboard' : '/my-tree')
    const dashboardUrl = `https://ecotrees.org${dashboardPath}`
    const dashboardLabel = isCommuntiy ? '🌿 View Community Dashboard' : isMiyawaki ? '🏙️ View Forest Dashboard' : isJoint ? '🤝 View Tree Dashboard' : '🌳 View My Tree Dashboard'

    let subject = ''
    let html    = ''

    if (type === 'welcome') {
      // Different subject and content for community vs individual
      if (isCommuntiy) {
        subject = `🌿 Your community contribution is confirmed — ${donor.tree_id}`
      } else if (isMiyawaki) {
        subject = `🏙️ Your Miyawaki forest sponsorship is confirmed — ${donor.tree_id}`
      } else if (isJoint) {
        subject = `🤝 Your joint tree share is confirmed — ${donor.tree_id}`
      } else {
        subject = `🌳 Your tree is confirmed — ${donor.tree_id}`
      }

      const passwordRow = donor.password
        ? `<tr><td style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.6);">Password</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#97BC62;text-align:right;">${donor.password} (change after login)</td></tr>`
        : ''

      // Tree details section — different for community vs individual
      const treeDetailsSection = isCommuntiy ? `
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#166534;margin-bottom:12px;">Your Contribution</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Certificate ID</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#1A3C34;text-align:right;font-family:monospace;">${donor.tree_id}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Type</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">Community Forest Initiative</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Location</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">Bangalore, Karnataka</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Impact</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">Community forest planting</td></tr>
          </table>
        </div>` : isMiyawaki ? `
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#166634;margin-bottom:12px;">Your Forest Sponsorship</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Certificate ID</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#1A3C34;text-align:right;font-family:monospace;">${donor.tree_id}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Type</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">Miyawaki Forest</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Species</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">30+ native species</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Location</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">Bangalore, Karnataka</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Status</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">Forest assignment pending</td></tr>
          </table>
        </div>` : isJoint ? `
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#166534;margin-bottom:12px;">Your Joint Tree Share</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Certificate ID</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#1A3C34;text-align:right;font-family:monospace;">${donor.tree_id}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Species preference</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.species || 'Any native species'}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Location</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">Bangalore, Karnataka</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Status</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#F59E0B;text-align:right;">Waiting for pool partner</td></tr>
          </table>
        </div>` : `
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#166534;margin-bottom:12px;">Your Tree Details</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Tree ID</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#1A3C34;text-align:right;font-family:monospace;">${donor.tree_id}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Species</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.species || 'Native species'}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Location</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">Bangalore, Karnataka</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Planted within</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">7 days</td></tr>
          </table>
        </div>`

      html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#1A3C34;padding:32px 40px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">${isCommuntiy ? '🌿' : isMiyawaki ? '🏙️' : isJoint ? '🤝' : '🌳'}</div>
            <div style="font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#97BC62;margin-bottom:8px;">EcoTree Impact Foundation</div>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:white;line-height:1.3;">${isCommuntiy ? 'Your community contribution<br/>is confirmed!' : isMiyawaki ? 'Your Miyawaki forest<br/>sponsorship is confirmed!' : isJoint ? 'Your joint tree share<br/>is confirmed!' : 'Payment Confirmed!<br/>Your tree is on its way.'}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi <strong>${donor.name}</strong>,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">Thank you for your contribution! Your support is making Bangalore greener.</p>
            ${treeDetailsSection}
            <div style="background:#1A3C34;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#97BC62;margin-bottom:12px;">🔐 Your Dashboard Login</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.6);">Dashboard URL</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:white;text-align:right;">ecotrees.org${dashboardPath}</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.6);">Email</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:white;text-align:right;">${donor.email}</td></tr>
                ${passwordRow}
              </table>
            </div>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${dashboardUrl}" style="display:inline-block;background:#2C5F2D;color:white;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">${dashboardLabel} →</a>
            </div>
            <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
              <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:12px;">What happens next:</div>
              <table cellpadding="0" cellspacing="0">
                ${isCommuntiy ? `
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">🌿</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Admin posts community plantation updates</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">📸</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Photos appear on your community dashboard</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">📜</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Download your certificate anytime</td></tr>
                ` : isJoint ? `
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">🤝</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Waiting for a pool partner to join</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">🌱</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Once matched, tree planted within 7 days</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">📧</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">You get a second email with dashboard access</td></tr>
                ` : isMiyawaki ? `
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">🏙️</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Admin assigns your Miyawaki forest patch</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">🌱</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">30+ species planted in dense urban forest</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">📊</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">BRSR report available on your dashboard</td></tr>
                ` : `
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">🌱</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Field worker plants your tree within 7 days</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">📸</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Before & after photos taken and uploaded</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">✅</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Admin verifies — you get a second email</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">📍</td><td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">GPS location appears on your personal map</td></tr>
                `}
              </table>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <div style="font-size:12px;color:#9ca3af;line-height:1.8;">EcoTree Impact Foundation · Bangalore, Karnataka<br/>Section 8 Company · 80G Approved · ISFR Standard<br/><a href="https://ecotrees.org" style="color:#2C5F2D;text-decoration:none;">ecotrees.org</a></div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    } else if (type === 'verified') {
      subject = `✅ Your ${donor.species || 'tree'} has been planted & verified! — ${donor.tree_id}`
      html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#1A3C34;padding:32px 40px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">🌱</div>
            <div style="font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#97BC62;margin-bottom:8px;">EcoTree Impact Foundation</div>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:white;line-height:1.3;">Your tree has been<br/>planted & verified! ✅</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi <strong>${donor.name}</strong>,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">Great news! Your <strong>${donor.species || 'tree'}</strong> has been planted and verified. It's now growing in Bangalore! 🌳</p>
            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#166534;margin-bottom:12px;">Tree Report</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Tree ID</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#1A3C34;text-align:right;font-family:monospace;">${donor.tree_id}</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Species</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.species || '—'}</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Location</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.site || 'Bangalore'}</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Health score</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#16a34a;text-align:right;">${donor.health_score || 85}/100 ✅</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">CO₂ offset</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">~22 kg/year</td></tr>
              </table>
            </div>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${dashboardUrl}" style="display:inline-block;background:#2C5F2D;color:white;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">${dashboardLabel} →</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <div style="font-size:12px;color:#9ca3af;line-height:1.8;">EcoTree Impact Foundation · Bangalore · 80G Approved<br/><a href="https://ecotrees.org" style="color:#2C5F2D;text-decoration:none;">ecotrees.org</a></div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    } else if (type === 'csr_enquiry') {
      subject = `CSR Proposal Request Received — EcoTree`
      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#1A3C34;padding:32px 40px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">🌿</div>
          <div style="font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#97BC62;margin-bottom:8px;">EcoTree Impact Foundation</div>
          <h1 style="margin:0;font-size:24px;font-weight:700;color:white;">Thank you, ${donor.name}!<br/>We'll be in touch soon.</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">We have received your CSR proposal request for <strong>${donor.company}</strong>. Our team will reach out within <strong>24 hours</strong> with a customised proposal.</p>
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Company</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.company}</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Budget</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.budget}</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Trees</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.trees}</td></tr>
            </table>
          </div>
          <div style="text-align:center;"><a href="https://ecotrees.org" style="display:inline-block;background:#1A3C34;color:white;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">Visit EcoTree →</a></div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <div style="font-size:12px;color:#9ca3af;">EcoTree Impact Foundation · Bangalore · BRSR-Ready · 80G Approved</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

    } else if (type === 'csr_verified') {
      subject = `✅ Your CSR trees are planted & verified — ${donor.company}`
      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#1A3C34;padding:32px 40px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">🌳</div>
          <div style="font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#97BC62;margin-bottom:8px;">EcoTree Impact Foundation</div>
          <h1 style="margin:0;font-size:24px;font-weight:700;color:white;">Your CSR trees are<br/>planted & verified! ✅</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi <strong>${donor.name}</strong>,</p>
          <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;"><strong>${donor.trees_planted}</strong> trees planted and verified for <strong>${donor.company}</strong> at ${donor.site || 'Bangalore'}.</p>
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Company</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.company}</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">Trees planted</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#1A3C34;text-align:right;">${donor.trees_planted} / ${donor.tree_count}</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">CO₂ offset</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#16a34a;text-align:right;">~${(donor.trees_planted||0) * 22} kg/year</td></tr>
            </table>
          </div>
          <div style="background:#1A3C34;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#97BC62;margin-bottom:12px;">🔐 Your CSR Dashboard</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.6);">Dashboard URL</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:white;text-align:right;">ecotrees.org/csr-dashboard</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.6);">Email</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:white;text-align:right;">${donor.email}</td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.6);">Password</td><td style="padding:4px 0;font-size:14px;font-weight:600;color:#97BC62;text-align:right;">123456 (change after login)</td></tr>
            </table>
          </div>
          <div style="text-align:center;">
            <a href="https://ecotrees.org/csr-dashboard" style="display:inline-block;background:#2C5F2D;color:white;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">📊 View CSR Dashboard →</a>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <div style="font-size:12px;color:#9ca3af;">EcoTree Impact Foundation · Bangalore · BRSR-Ready · 80G Approved</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from:    'EcoTree <hello@ecotrees.org>',
      to:      donor.email,
      replyTo: 'bhimsen.g@gmail.com',
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })

  } catch (err: any) {
    console.error('Email API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
