# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a serverless QR code check-in system built with AWS SAM (Serverless Application Model). The application manages event registrant check-ins using QR codes, leveraging AWS Lambda functions and DynamoDB for data storage.

## Technology Stack

- **Runtime**: Node.js >=18.x
- **Cloud Platform**: AWS (Lambda, DynamoDB)
- **Infrastructure**: AWS SAM
- **Key Dependencies**:
  - `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` - AWS SDK v3 for DynamoDB operations
  - `qrcode` - QR code generation
  - `uuid` - UUID generation for unique identifiers

## Common Commands

### Deployment
```bash
# Build and deploy SAM application (guided)
yarn deploy

# Manual SAM commands
sam build
sam deploy --guided
```

### Data Management
```bash
# Seed DynamoDB with sample registrant data
yarn seed

# Generate QR codes for registrants
yarn generate-qr
```

## Deployment Workflow

**IMPORTANT**: Follow this exact order for first-time deployment:

```bash
# 1. Install dependencies
yarn install

# 2. Build and deploy SAM application to AWS
yarn deploy
# This will output an API Gateway URL - SAVE THIS URL!

# 3. Seed the DynamoDB table with registrant data
yarn seed

# 4. Generate QR codes using your actual API Gateway URL
API_URL=https://your-api-id.execute-api.region.amazonaws.com/Prod npm run generate-qr
```

**Critical Notes**:
- You MUST set `API_URL` environment variable when generating QR codes
- QR code generation requires `scripts/registrants.json` (created by seed script)
- The seed script must run AFTER deployment (requires DynamoDB table to exist)
- All generated QR codes are saved to `qr-codes/` directory (gitignored)

## Prerequisites

Before deployment, ensure:
- AWS CLI configured with appropriate credentials
- AWS SAM CLI installed (`sam --version`)
- Node.js 18.x or higher
- Sufficient AWS permissions for:
  - CloudFormation stack creation
  - Lambda function deployment
  - DynamoDB table creation
  - API Gateway creation

## Architecture

### Directory Structure
- `src/handlers/` - Lambda function handlers (API endpoints)
- `src/services/` - Service layer for business logic (DynamoDB operations)
- `src/utils/` - Shared utilities (e.g., HTTP response helpers)
- `scripts/` - Utility scripts for data seeding and QR code generation (**NOT** in src/)
- `template.yaml` - SAM template defining AWS resources
- `qr-codes/` - Generated QR code images (gitignored, created by generate-qr script)

### Data Flow
1. Registrants are stored in DynamoDB with unique tokens
2. Scripts generate unique QR codes for each registrant containing check-in URLs
3. Lambda handlers process check-in requests when QR codes are scanned
4. DynamoDB services manage registrant data persistence and check-in state

### AWS SDK Usage
The project uses AWS SDK v3, which has a modular architecture:
- Import specific clients: `@aws-sdk/client-dynamodb`
- Use Document Client for simplified DynamoDB operations: `@aws-sdk/lib-dynamodb`
- Follow v3 patterns (command objects) instead of v2 callback/promise styles

### Error Handling Patterns
All DynamoDB operations include comprehensive error handling:
- Try-catch blocks around all async operations
- Descriptive error messages with context
- Console logging for debugging
- Error re-throwing with enhanced messages

## Common Pitfalls & Troubleshooting

### "API_URL is not configured" Error
- **Cause**: Running QR code generation without setting API_URL environment variable
- **Fix**: Set API_URL before running: `API_URL=https://... npm run generate-qr`
- **Prevention**: Always copy the API Gateway URL from SAM deployment outputs

### "registrants.json not found" Error
- **Cause**: Running QR code generation before seeding database
- **Fix**: Run `npm run seed` first to create registrants.json
- **Prevention**: Follow deployment workflow order

### Script Path Issues
- Scripts are in `scripts/` directory (root level), NOT `src/scripts/`
- Package.json references are correct as `scripts/seed-registrants.js`
- Do NOT move scripts to src/ directory

### DynamoDB Access Errors
- Ensure AWS credentials are configured: `aws configure`
- Verify IAM permissions include DynamoDB access
- Check table name matches: `event_registrants`
- Confirm region matches deployment region
