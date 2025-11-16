const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// Initialize AWS SDK v3 client
const ddbClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = process.env.TABLE_NAME || "event_registrants";

// Sample registrants (replace with your actual data)
const registrants = [
  { email: "john.doe@example.com", name: "John Doe" },
  { email: "jane.smith@example.com", name: "Jane Smith" },
  { email: "bob.wilson@example.com", name: "Bob Wilson" },
  // Add your 110 registrants here
];

async function seedRegistrants() {
  console.log(`Seeding ${registrants.length} registrants to DynamoDB...`);

  const registrantsWithTokens = [];

  for (const registrant of registrants) {
    const token = uuidv4();
    const item = {
      email: registrant.email.toLowerCase().trim(),
      name: registrant.name,
      token: token,
      checkedIn: false,
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: TABLE_NAME,
      Item: item,
    };

    try {
      await dynamodb.send(new PutCommand(params));
      console.log(`✓ Added ${registrant.email}`);
      registrantsWithTokens.push(item);
    } catch (error) {
      console.error(`✗ Failed to add ${registrant.email}:`, error);
    }
  }

  // Save registrants with tokens to file for QR generation
  const outputPath = path.join(__dirname, "registrants.json");
  fs.writeFileSync(outputPath, JSON.stringify(registrantsWithTokens, null, 2));
  console.log(`\nRegistrants data saved to: ${outputPath}`);
}

seedRegistrants();
