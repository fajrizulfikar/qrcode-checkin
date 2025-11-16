/**
 * Generate HTML response for check-in
 */
function generateHTMLResponse(success, message, registrant = null) {
  const statusColor = success ? "#10b981" : "#ef4444";
  const statusIcon = success ? "✓" : "✗";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Check-in ${success ? "Success" : "Failed"}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }
        .status-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: ${statusColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          margin: 0 auto 20px;
          animation: scaleIn 0.3s ease-out;
        }
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        h1 {
          color: #1f2937;
          margin-bottom: 10px;
          font-size: 28px;
        }
        .message {
          color: #6b7280;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .details {
          background: #f9fafb;
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #4b5563;
        }
        .detail-value {
          color: #1f2937;
        }
        .timestamp {
          margin-top: 20px;
          font-size: 14px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="status-icon">${statusIcon}</div>
        <h1>${success ? "Check-in Successful!" : "Check-in Failed"}</h1>
        <p class="message">${message}</p>
        ${
          registrant
            ? `
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${registrant.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${registrant.email}</span>
            </div>
            ${
              registrant.checkedInAt
                ? `
              <div class="detail-row">
                <span class="detail-label">Checked in at:</span>
                <span class="detail-value">${new Date(
                  registrant.checkedInAt
                ).toLocaleString()}</span>
              </div>
            `
                : ""
            }
          </div>
        `
            : ""
        }
        <p class="timestamp">Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  return {
    statusCode: success ? 200 : 400,
    headers: {
      "Content-Type": "text/html",
    },
    body: html,
  };
}

/**
 * Generate JSON response
 */
function generateJSONResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

module.exports = {
  generateHTMLResponse,
  generateJSONResponse,
};
