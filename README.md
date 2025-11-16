# QR Code Event Check-in System

A serverless event management system that enables contactless attendee check-ins using QR codes. Built with AWS SAM (Serverless Application Model), this application provides a scalable, cost-effective solution for managing event registrations and check-ins.

## Features

- **Contactless Check-in**: Attendees scan unique QR codes to check in instantly
- **Real-time Validation**: Prevents duplicate check-ins and validates registrant tokens
- **Serverless Architecture**: Automatically scales with demand, pay only for what you use
- **Unique QR Codes**: Each registrant receives a unique QR code linked to their token
- **HTML Response Pages**: User-friendly success/error pages displayed after scanning
- **DynamoDB Storage**: Fast, reliable data persistence with global secondary indexes
- **Batch Operations**: Seed multiple registrants and generate QR codes in bulk

## Architecture

```
┌─────────────┐
│  QR Code    │
│  (Scanned)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  API Gateway        │
│  /checkin?token=... │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Lambda Function    │
│  (Check-in Handler) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  DynamoDB Table     │
│  event_registrants  │
└─────────────────────┘
```

### Components

- **API Gateway**: RESTful endpoint for QR code check-in requests
- **Lambda Function**: Serverless compute handling check-in logic
- **DynamoDB**: NoSQL database storing registrant data with GSI for token lookups
- **QR Codes**: PNG images containing unique check-in URLs

## Prerequisites

Before deploying this application, ensure you have:

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **AWS CLI** configured with valid credentials ([Setup Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html))
- **AWS SAM CLI** installed ([Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
- **Yarn** package manager (or use npm)
- **AWS Account** with permissions for:
  - CloudFormation stack creation
  - Lambda function deployment
  - DynamoDB table creation
  - API Gateway creation
  - IAM role creation

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd qrcode-checkin
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

## Deployment

Follow these steps **in order** for first-time deployment:

### Step 1: Deploy to AWS

```bash
yarn deploy
# or
npm run deploy
```

This command will:
- Build the SAM application
- Package Lambda functions
- Deploy CloudFormation stack
- Create DynamoDB table and API Gateway

**IMPORTANT**: Save the API Gateway URL from the deployment output. You'll need it for Step 3.

### Step 2: Seed the Database

```bash
yarn seed
# or
npm run seed
```

This will:
- Create sample registrant records in DynamoDB
- Generate unique tokens for each registrant
- Save registrant data to `scripts/registrants.json`

**Note**: Edit `scripts/seed-registrants.js` to add your actual registrant list before running.

### Step 3: Generate QR Codes

```bash
API_URL=https://your-api-id.execute-api.region.amazonaws.com/Prod yarn generate-qr
# or
API_URL=https://your-api-id.execute-api.region.amazonaws.com/Prod npm run generate-qr
```

Replace `your-api-id` and `region` with values from Step 1 deployment output.

This will:
- Generate PNG QR codes for each registrant
- Save QR codes to `qr-codes/` directory
- Each QR code contains a unique check-in URL with the registrant's token

## Usage

### For Event Organizers

1. **Deploy the application** following the deployment steps above
2. **Add registrants** by editing `scripts/seed-registrants.js` with actual attendee data
3. **Run the seed script** to populate DynamoDB
4. **Generate QR codes** using the deployed API URL
5. **Distribute QR codes** to registrants via email, tickets, or printed badges

### For Attendees

1. **Receive QR code** via email or on event ticket
2. **Scan QR code** using any QR code scanner app or camera
3. **View confirmation** page showing check-in status
4. **Enter event** after successful check-in

### Check-in Flow

1. Attendee scans QR code containing URL: `https://api-url/Prod/checkin?token=abc123`
2. API Gateway routes request to Lambda function
3. Lambda validates token and checks registrant status
4. If valid and not checked in:
   - DynamoDB record updated with `checkedIn: true` and timestamp
   - Success HTML page displayed
5. If already checked in or invalid:
   - Error HTML page displayed with appropriate message

## Project Structure

```
qrcode-checkin/
├── src/
│   ├── handlers/
│   │   └── checkin.js          # Lambda handler for check-in endpoint
│   ├── services/
│   │   └── dynamodb.js         # DynamoDB operations (CRUD)
│   └── utils/
│       └── response.js         # HTTP response helpers
├── scripts/
│   ├── seed-registrants.js     # Seed DynamoDB with registrants
│   └── generate-qr-codes.js    # Generate QR code images
├── qr-codes/                   # Generated QR codes (gitignored)
├── template.yaml               # AWS SAM template
├── package.json                # Node.js dependencies and scripts
├── CLAUDE.md                   # Claude Code project instructions
└── README.md                   # This file
```

## API Endpoints

### GET /checkin

Check in a registrant using their unique token.

**Query Parameters:**
- `token` (required): Unique UUID token for the registrant

**Response:**
- `200 OK`: HTML page with success or error message
- Includes registrant information on success

**Example:**
```
GET https://your-api.execute-api.us-east-1.amazonaws.com/Prod/checkin?token=550e8400-e29b-41d4-a716-446655440000
```

**Success Response:**
```html
<!DOCTYPE html>
<html>
<body>
  <h1 style="color: green;">✓ Welcome to the event!</h1>
  <p>Name: John Doe</p>
  <p>Email: john.doe@example.com</p>
</body>
</html>
```

**Error Scenarios:**
- Missing token: "Invalid QR code: Missing token"
- Invalid token: "Invalid QR code: Registrant not found"
- Already checked in: "Already checked in!"
- Server error: "An error occurred during check-in. Please contact staff."

## Technologies Used

- **Runtime**: Node.js 18.x
- **Cloud Platform**: AWS (Lambda, DynamoDB, API Gateway, CloudFormation)
- **Infrastructure as Code**: AWS SAM
- **Database**: Amazon DynamoDB with Global Secondary Index
- **Dependencies**:
  - `@aws-sdk/client-dynamodb` - AWS SDK v3 for DynamoDB client
  - `@aws-sdk/lib-dynamodb` - DynamoDB Document Client (simplified operations)
  - `qrcode` - QR code generation library
  - `uuid` - UUID v4 generation for unique tokens

## DynamoDB Schema

### Table: event_registrants

**Primary Key:**
- `email` (String) - Partition key

**Attributes:**
- `name` (String) - Registrant full name
- `token` (String) - Unique UUID for QR code
- `checkedIn` (Boolean) - Check-in status
- `checkedInAt` (String) - ISO timestamp of check-in
- `createdAt` (String) - ISO timestamp of registration

**Global Secondary Index:**
- `idx_token` - Allows fast lookup by token
  - Partition key: `token`
  - Projection: ALL

## Configuration

### Environment Variables

The application uses the following environment variables:

- `TABLE_NAME` - DynamoDB table name (default: `event_registrants`)
- `API_URL` - API Gateway URL for QR code generation (set during deployment)

### AWS SAM Configuration

Key configurations in `template.yaml`:

- **Runtime**: nodejs18.x
- **Timeout**: 10 seconds
- **Billing Mode**: PAY_PER_REQUEST (on-demand pricing)
- **Memory**: Default (128 MB)

## Troubleshooting

### "API_URL is not configured" Error
**Cause**: Running QR code generation without setting API_URL environment variable
**Fix**: Set API_URL before running: `API_URL=https://... npm run generate-qr`

### "registrants.json not found" Error
**Cause**: Running QR code generation before seeding database
**Fix**: Run `npm run seed` first to create registrants.json

### DynamoDB Access Errors
- Ensure AWS credentials are configured: `aws configure`
- Verify IAM permissions include DynamoDB access
- Check table name matches: `event_registrants`
- Confirm region matches deployment region

### QR Code Not Working
- Verify API_URL is correct in QR code
- Check Lambda function logs in CloudWatch
- Ensure token exists in DynamoDB
- Test endpoint directly in browser

## Cost Estimation

This serverless architecture is cost-effective for events:

- **DynamoDB**: Pay-per-request pricing (~$1.25 per million requests)
- **Lambda**: First 1M requests free, then $0.20 per 1M requests
- **API Gateway**: $3.50 per million API calls
- **Estimated cost for 1,000 attendees**: < $1 USD

## Security Considerations

- Tokens are UUIDs (version 4) - cryptographically random and unguessable
- HTTPS enforced via API Gateway
- No sensitive data exposed in QR codes
- Lambda execution role follows least-privilege principle
- DynamoDB access restricted to Lambda function via IAM policies

## Future Enhancements

Potential features for future versions:

- [ ] Admin dashboard for real-time check-in monitoring
- [ ] Email distribution of QR codes
- [ ] Multi-event support
- [ ] Check-out functionality
- [ ] Analytics and reporting
- [ ] Mobile app for scanning
- [ ] Export check-in data to CSV

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

This means:
- ✓ You can use this software for any purpose
- ✓ You can modify the software
- ✓ You can distribute original or modified versions
- ✓ You can use it privately or commercially

**However:**
- ✗ You must disclose the source code when distributing
- ✗ You must license derivative works under GPL-3.0
- ✗ You must include the original license and copyright notice
- ✗ No warranty is provided

See the [LICENSE](LICENSE) file for the full license text, or visit [GNU GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) for more details.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Submit a pull request
- Contact the maintainer

## Acknowledgments

- Built with [AWS SAM](https://aws.amazon.com/serverless/sam/)
- QR codes generated with [node-qrcode](https://github.com/soldair/node-qrcode)
- Powered by [AWS Lambda](https://aws.amazon.com/lambda/) and [DynamoDB](https://aws.amazon.com/dynamodb/)

---

**Made with ❤️ for seamless event experiences**
