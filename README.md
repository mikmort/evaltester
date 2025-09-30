# EvalTester - Invoice Matching Test Suite

This repository contains test data and a React application for evaluating invoice line to GL account matching using Azure OpenAI.

## Repository Structure

- **invoice-tester/** - TypeScript React application for running invoice matching tests
- **ChatTest.md** - Instructions for the AI on how to format and process test results
- **Deployment_Guide.md** - Guide for Azure OpenAI deployment
- **LarryLegal_*.yaml** - Test data files for LarryLegal test scenarios:
  - `LarryLegal_glaccounts.yaml` - Chart of accounts (GL accounts)
  - `LarryLegal_vendors.yaml` - Vendor master data
  - `LarryLegal_historical_large.yaml` - Historical purchase data
  - `LarryLegal_testscenarios_standard_accuracy.yaml` - Standard test scenarios
  - `LarryLegal_testscenarios_challenge_accuracy.yaml` - Challenge test scenarios
- **LarryLegal_policy.md** - Accounting structural policies

## Getting Started

### Using the Invoice Test Runner Application

The `invoice-tester` directory contains a React TypeScript application that provides a user-friendly interface for running invoice matching tests.

See [invoice-tester/README.md](invoice-tester/README.md) for detailed instructions on:
- Installing and running the application
- Configuring Azure OpenAI
- Uploading test files
- Running tests and downloading results

### Quick Start

1. Navigate to the invoice-tester directory:
   ```bash
   cd invoice-tester
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173/`

## Test Data Files

### Test Scenarios

Files with `*testscenarios*` in the name contain invoice line matching test cases. Each test includes:
- Test name and description
- Vendor information
- Line items with descriptions
- Expected GL account mappings

### GL Accounts

Files with `*glaccounts*` contain the chart of accounts with:
- Account IDs
- Account names
- Account types and categories

### Vendors

Files with `*vendors*` contain vendor master data with:
- Vendor numbers
- Names
- Addresses
- Country codes

### Historical Data

Files with `*historical*` contain historical purchase lines showing:
- Past vendor transactions
- Line descriptions
- `item_no` field (purchase_type_no) - the GL account historically chosen

### Policy Files

Files ending in `*_policy.md` contain structural accounting policies for:
- Category and classification rules
- Period/timing policies
- Capitalization boundaries

## How It Works

1. **Upload Files**: The app reads test scenarios, GL accounts, vendors, and optionally historical data
2. **Select Tests**: Choose which test scenarios to run
3. **AI Processing**: For each test, the app:
   - Sends the context (GL accounts, vendors, historical data) to Azure OpenAI
   - Asks the AI to act as an accounting professional
   - Requests GL account predictions for each invoice line
4. **View Results**: Results are displayed inline in CSV format
5. **Export**: Download results as CSV for further analysis

## Expected Output Format

The application returns results in CSV format with the following columns:

```csv
test_no,line_no,description,predicted_account_id
```

Where:
- `test_no` - Test scenario identifier
- `line_no` - Line item identifier
- `description` - Invoice line description
- `predicted_account_id` - AI-predicted GL account number

## Requirements

- Node.js (LTS version)
- Azure OpenAI resource with API access
- Deployed GPT model (e.g., GPT-4)

## License

This project is provided as-is for invoice matching evaluation purposes.
