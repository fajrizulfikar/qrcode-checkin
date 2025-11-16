const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

// Your API Gateway URL (update after deployment)
const API_URL =
  process.env.API_URL ||
  "https://YOUR-API-GATEWAY-URL.execute-api.us-east-1.amazonaws.com/prod";

// Validate API_URL
if (API_URL.includes("YOUR-API-GATEWAY-URL")) {
  console.error("❌ ERROR: API_URL is not configured!");
  console.error("Please set the API_URL environment variable with your actual API Gateway URL.");
  console.error("Example: API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/Prod node scripts/generate-qr-codes.js");
  process.exit(1);
}

// Load registrants data with error handling
const registrantsPath = path.join(__dirname, "registrants.json");
if (!fs.existsSync(registrantsPath)) {
  console.error("❌ ERROR: registrants.json not found!");
  console.error("Please run 'npm run seed' first to generate the registrants data.");
  process.exit(1);
}

let registrants;
try {
  registrants = require("./registrants.json");
} catch (error) {
  console.error("❌ ERROR: Failed to parse registrants.json:", error.message);
  process.exit(1);
}

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
