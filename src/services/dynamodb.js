const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME || "event_registrants";

// Base client (region/config comes from env / shared config)
const ddbClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(ddbClient);

/**
 * Get registrant by email
 */
async function getRegistrantByEmail(email) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      email: email.toLowerCase().trim(),
    },
  };

  const result = await dynamodb.send(new GetCommand(params));
  return result.Item;
}

/**
 * Get registrant by token
 */
async function getRegistrantByToken(token) {
  const params = {
    TableName: TABLE_NAME,
    IndexName: "idx_token",
    KeyConditionExpression: "#token = :token",
    ExpressionAttributeNames: {
      "#token": "token",
    },
    ExpressionAttributeValues: {
      ":token": token,
    },
  };

  const result = await dynamodb.send(new QueryCommand(params));
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

/**
 * Mark registrant as checked in
 */
async function checkInRegistrant(email) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      email: email.toLowerCase().trim(),
    },
    UpdateExpression: "SET checkedIn = :true, checkedInAt = :timestamp",
    ExpressionAttributeValues: {
      ":true": true,
      ":timestamp": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamodb.send(new UpdateCommand(params));
  return result.Attributes;
}

/**
 * Create registrant
 */
async function createRegistrant(email, name, token) {
  const item = {
    email: email.toLowerCase().trim(),
    name,
    token,
    checkedIn: false,
    createdAt: new Date().toISOString(),
  };

  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };

  await dynamodb.send(new PutCommand(params));
  return item;
}

module.exports = {
  getRegistrantByEmail,
  getRegistrantByToken,
  checkInRegistrant,
  createRegistrant,
};
