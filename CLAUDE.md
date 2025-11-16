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
npm run deploy

# Manual SAM commands
sam build
sam deploy --guided
```

### Data Management
```bash
# Seed DynamoDB with sample registrant data
npm run seed

# Generate QR codes for registrants
npm run generate-qr
```

## Architecture

### Directory Structure
- `src/handlers/` - Lambda function handlers (API endpoints)
- `src/services/` - Service layer for business logic (DynamoDB operations)
- `src/scripts/` - Utility scripts for data seeding and QR code generation
- `src/utils/` - Shared utilities (e.g., HTTP response helpers)
- `template.yaml` - SAM template defining AWS resources

### Data Flow
1. Registrants are stored in DynamoDB
2. Scripts generate unique QR codes for each registrant
3. Lambda handlers process check-in requests when QR codes are scanned
4. DynamoDB services manage registrant data persistence

### AWS SDK Usage
The project uses AWS SDK v3, which has a modular architecture:
- Import specific clients: `@aws-sdk/client-dynamodb`
- Use Document Client for simplified DynamoDB operations: `@aws-sdk/lib-dynamodb`
- Follow v3 patterns (command objects) instead of v2 callback/promise styles
