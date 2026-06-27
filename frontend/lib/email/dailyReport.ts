export function dailyReportHtml({
  totalUsers,
  todayJoins,
}: {
  totalUsers: number;
  todayJoins: number;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Frugal Daily Report</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:480px;width:100%;text-align:left;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
          
          <!-- Header -->
          <tr>
            <td style="background:#050505;padding:32px 40px;text-align:center;">
              <span style="font-size:20px;font-weight:600;letter-spacing:-0.02em;color:#ffffff;">
                Frugal Admin
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 24px 0;font-size:24px;font-weight:600;line-height:1.2;color:#050505;letter-spacing:-0.02em;">
                Daily Wishlist Report
              </h1>
              
              <p style="margin:0 0 32px 0;font-size:15px;line-height:1.6;color:#555555;">
                Here is the latest update on the pre-launch wishlist performance.
              </p>

              <div style="background:#fafafa;border:1px solid #eaeaea;border-radius:8px;padding:24px;margin-bottom:32px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:16px;">
                      <span style="display:block;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888888;font-weight:600;margin-bottom:4px;">Users joined today</span>
                      <span style="display:block;font-size:32px;font-weight:600;color:#050505;letter-spacing:-0.02em;">${todayJoins}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #eaeaea;padding-top:16px;">
                      <span style="display:block;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888888;font-weight:600;margin-bottom:4px;">Total wishlist users</span>
                      <span style="display:block;font-size:24px;font-weight:500;color:#050505;letter-spacing:-0.02em;">${totalUsers}</span>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function dailyReportText({
  totalUsers,
  todayJoins,
}: {
  totalUsers: number;
  todayJoins: number;
}) {
  return `FRUGAL ADMIN REPORT

Daily Wishlist Report

Users joined today: ${todayJoins}
Total wishlist users: ${totalUsers}
`;
}
