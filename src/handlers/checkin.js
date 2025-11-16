const {
  getRegistrantByToken,
  checkInRegistrant,
} = require("../services/dynamodb");
const { generateHTMLResponse } = require("../utils/response");

/**
 * Lambda handler for QR code check-in
 */
exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Extract token from query string
    const token = event.queryStringParameters?.token;

    if (!token) {
      return generateHTMLResponse(false, "Invalid QR code: Missing token");
    }

    // Get registrant by token
    const registrant = await getRegistrantByToken(token);

    if (!registrant) {
      return generateHTMLResponse(
        false,
        "Invalid QR code: Registrant not found"
      );
    }

    // Check if already checked in
    if (registrant.checkedIn) {
      return generateHTMLResponse(false, "Already checked in!", registrant);
    }

    // Check in the registrant
    const updatedRegistrant = await checkInRegistrant(registrant.email);

    return generateHTMLResponse(
      true,
      "Welcome to the event!",
      updatedRegistrant
    );
  } catch (error) {
    console.error("Error:", error);
    return generateHTMLResponse(
      false,
      "An error occurred during check-in. Please contact staff."
    );
  }
};
