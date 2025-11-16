const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

// Your API Gateway URL (update after deployment)
const API_URL =
  process.env.API_URL ||
  "https://YOUR-API-GATEWAY-URL.execute-api.us-east-1.amazonaws.com/prod";

// Sample registrants data
const registrants = require("./registrants.json");

async function generateQRCodes() {
  const outputDir = path.join(__dirname, "../qr-codes");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating QR codes for ${registrants.length} registrants...`);

  for (const registrant of registrants) {
    const url = `${API_URL}/checkin?token=${registrant.token}`;
    const filename = `${registrant.email.replace("@", "_at_")}.png`;
    const filepath = path.join(outputDir, filename);

    try {
      await QRCode.toFile(filepath, url, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      console.log(`✓ Generated QR code for ${registrant.email}`);
    } catch (error) {
      console.error(
        `✗ Failed to generate QR code for ${registrant.email}:`,
        error
      );
    }
  }

  console.log(`\nQR codes saved to: ${outputDir}`);
}

generateQRCodes();
