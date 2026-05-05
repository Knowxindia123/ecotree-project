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

    let subject = ''
    let html    = ''

    // ── EMAIL 1: Payment confirmation + login credentials ──
    if (type === 'welcome') {
      subject = `🌳 Your tree is confirmed — ${donor.tree_id}`
      html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your EcoTree is on its way!</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1A3C34;padding:32px 40px;text-align:center;">
              <div style="font-size:40px;margin-bottom:8px;">🌳</div>
              <div style="font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#97BC62;margin-bottom:8px;">EcoTree Impact Foundation</div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:white;line-height:1.3;">Payment Confirmed!<br/>Your tree is on its way.</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi <strong>${donor.name}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">
                Thank you for planting a tree with us! Your contribution is making Bangalore greener. Here's everything you need to know.
              </p>

              <!-- Tree details box -->
              <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#166534;margin-bottom:12px;">Your Tree Details</div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">Tree ID</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#1A3C34;text-align:right;font-family:monospace;">${donor.tree_id}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">Species</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.species || 'Common Species'}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">Location</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">Bangalore, Karnataka</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">Planted within</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">7 days</td>
                  </tr>
                </table>
              </div>

              <!-- Login credentials box -->
              <div style="background:#1A3C34;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#97BC62;margin-bottom:12px;">🔐 Your Dashboard Login</div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.6);">Dashboard URL</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:white;text-align:right;">ecotrees.org/my-tree</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.6);">Email</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:white;text-align:right;">${donor.email}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.6);">Password</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#97BC62;text-align:right;">1234 (change after login)</td>
                  </tr>
                </table>
              </div>

              <!-- CTA button -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="https://ecotrees.org/my-tree" style="display:inline-block;background:#2C5F2D;color:white;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">
                  🌳 View My Tree Dashboard →
                </a>
              </div>

              <!-- What happens next -->
              <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
                <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:12px;">What happens next:</div>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:4px 0;font-size:13px;color:#6B7280;">🌱</td>
                    <td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Field worker plants your tree within 7 days</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:13px;color:#6B7280;">📸</td>
                    <td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Before & after photos taken and uploaded</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:13px;color:#6B7280;">✅</td>
                    <td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">Admin verifies — you get a second email</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:13px;color:#6B7280;">📍</td>
                    <td style="padding:4px 0 4px 8px;font-size:13px;color:#6B7280;">GPS location appears on your personal map</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <div style="font-size:12px;color:#9ca3af;line-height:1.8;">
                EcoTree Impact Foundation · Bangalore, Karnataka<br/>
                Section 8 Company · 80G Approved · ISFR Standard<br/>
                <a href="https://ecotrees.org" style="color:#2C5F2D;text-decoration:none;">ecotrees.org</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    }

    // ── EMAIL 2: Tree planted + verified ──
    else if (type === 'verified') {
      subject = `✅ Your ${donor.species || 'tree'} has been planted & verified! — ${donor.tree_id}`
      html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1A3C34;padding:32px 40px;text-align:center;">
              <div style="font-size:40px;margin-bottom:8px;">🌱</div>
              <div style="font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#97BC62;margin-bottom:8px;">EcoTree Impact Foundation</div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:white;line-height:1.3;">Your tree has been<br/>planted & verified! ✅</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi <strong>${donor.name}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">
                Great news! Your <strong>${donor.species || 'tree'}</strong> has been planted and verified by our team. It's now growing in Bangalore! 🌳
              </p>

              <!-- Photos -->
              ${donor.before_photo_url && donor.after_photo_url ? `
              <div style="margin-bottom:24px;">
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6B7280;margin-bottom:10px;">Before & After</div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="48%" style="padding-right:8px;">
                      <img src="${donor.before_photo_url}" alt="Before" style="width:100%;border-radius:8px;display:block;" />
                      <div style="font-size:11px;color:#9ca3af;text-align:center;margin-top:4px;">Before</div>
                    </td>
                    <td width="4%"></td>
                    <td width="48%" style="padding-left:8px;">
                      <img src="${donor.after_photo_url}" alt="After" style="width:100%;border-radius:8px;display:block;" />
                      <div style="font-size:11px;color:#9ca3af;text-align:center;margin-top:4px;">After planting</div>
                    </td>
                  </tr>
                </table>
              </div>` : ''}

              <!-- Tree stats -->
              <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#166534;margin-bottom:12px;">Tree Report</div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">Tree ID</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#1A3C34;text-align:right;font-family:monospace;">${donor.tree_id}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">Species</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.species || '—'}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">Location</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">${donor.site || 'Bangalore'}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">Health score</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#16a34a;text-align:right;">${donor.health_score || 85}/100 ✅</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">GPS verified</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#16a34a;text-align:right;">${donor.latitude ? '✅ Yes' : '—'}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6B7280;">CO₂ offset</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;color:#374151;text-align:right;">~22 kg/year</td>
                  </tr>
                </table>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="https://ecotrees.org/my-tree" style="display:inline-block;background:#2C5F2D;color:white;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;margin-bottom:12px;">
                  📍 View on My Map →
                </a>
                <br/>
                <a href="https://ecotrees.org/tree/${donor.tree_id}" style="display:inline-block;font-size:13px;color:#2C5F2D;text-decoration:none;margin-top:8px;">
                  View tree profile →
                </a>
              </div>

              <!-- Share -->
              <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;text-align:center;">
                <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">🌍 Share your impact</div>
                <div style="font-size:13px;color:#6B7280;margin-bottom:12px;">
                  🌳 I planted a ${donor.species || 'tree'} with EcoTree Impact Foundation!<br/>
                  ${donor.health_score || 85}% health · Growing in Bangalore 💚
                </div>
                <a href="https://wa.me/?text=${encodeURIComponent(`🌳 I just planted a tree with EcoTree Impact Foundation!\n🌿 It's verified and growing in Bangalore 💚\nhttps://ecotrees.org/tree/${donor.tree_id}`)}"
                  style="display:inline-block;background:#25D366;color:white;font-size:13px;font-weight:700;padding:8px 20px;border-radius:999px;text-decoration:none;">
                  💬 Share on WhatsApp
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <div style="font-size:12px;color:#9ca3af;line-height:1.8;">
                EcoTree Impact Foundation · Bangalore, Karnataka<br/>
                Section 8 Company · 80G Approved · ISFR Standard<br/>
                <a href="https://ecotrees.org" style="color:#2C5F2D;text-decoration:none;">ecotrees.org</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from:     'EcoTree <hello@ecotrees.org>',
      to:       donor.email,
      replyTo:  'bhimsen.g@gmail.com',
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
