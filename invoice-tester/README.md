# Invoice Matching Test Runner

A TypeScript React application for testing invoice matching using Azure OpenAI. This app allows users to run test scenarios that use AI to match invoice lines to the appropriate GL (General Ledger) accounts.

## Features

- **Test Scenario Selection**: Upload and select from multiple test scenarios
- **Azure OpenAI Integration**: Uses AI to determine the best matching GL account for each invoice line
- **Historical Data Support**: Optionally include historical purchase data to improve matching accuracy
- **Interactive UI**: Select which tests to run and view results in real-time
- **CSV Export**: Download results as CSV for further analysis

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- An Azure OpenAI resource with access to a deployed model (e.g., GPT-4)
- Test data files (YAML format)

### Installation

1. Navigate to the invoice-tester directory:
   ```bash
   cd invoice-tester
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173/`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

### 1. Configure Azure OpenAI

In the application, provide:
- **Endpoint**: Your Azure OpenAI resource endpoint (e.g., `https://your-resource.openai.azure.com/`)
- **API Key**: Your Azure OpenAI API key
- **Deployment Name**: The name of your deployed model (e.g., `gpt-4`)

### 2. Upload Required Files

The following files are required:

- **Test Scenarios** (required): YAML file containing test scenarios (files with `*testscenarios*` in the name)
  - Example: `LarryLegal_testscenarios_standard_accuracy.yaml`
  
- **GL Accounts** (required): YAML file containing the chart of accounts (files with `*glaccounts*` in the name)
  - Example: `LarryLegal_glaccounts.yaml`
  
- **Vendors** (required): YAML file containing vendor information (files with `*vendors*` in the name)
  - Example: `LarryLegal_vendors.yaml`

### 3. Optional Files

- **Historical Data**: Check the "Include Historical Data" box and upload a YAML file with historical purchase data (files with `*historical*` in the name)
  - Example: `LarryLegal_historical_large.yaml`
  - Historical data includes the `item_no` field (purchase_type_no) indicating previously chosen accounts
  
- **Chat Instructions**: Upload a markdown file with specific instructions for the AI
  - Example: `ChatTest.md`

### 4. Select Test Scenarios

After uploading the test scenarios file, the available tests will appear. You can:
- Select individual tests by checking their boxes
- Use "Select All" to run all tests
- Use "Deselect All" to clear your selection

### 5. Run Tests

Click the "Run Tests" button to:
1. Send each selected test to Azure OpenAI
2. Receive predicted GL account mappings
3. Display results in CSV format

### 6. Download Results

Click "Download as CSV" to save the results to your computer. The CSV will contain:
- `test_no`: Test scenario identifier
- `line_no`: Line item identifier
- `description`: Invoice line description
- `predicted_account_id`: AI-predicted GL account number

## Data Format

### Test Scenarios YAML Structure

```yaml
tests:
  - name: TestName-001
    description: "Test description"
    vendor: "Vendor Name"
    line_items:
      - line_id: 10000
        description: "Item description"
        amount: 1000.00
    expected_data:
      - line_id: 10000
        account_id: "54000"
```

### GL Accounts YAML Structure

```yaml
test_setup:
  glAccountsToCreate:
    - account_id: 54000
      name: "Legal Research Subscriptions"
      account_posting_type: "Posting"
      account_category: "Expense"
      account_subcategory: "Operating Expenses"
```

### Vendors YAML Structure

```yaml
test_setup:
  vendorsToCreate:
    - vendorNo: V001
      name: "Vendor Name"
      city: "City"
      countryCode: "US"
```

### Historical Data YAML Structure

```yaml
test_setup:
  historicalPurchaseLinesToCreate:
    - vendor_no: "V001"
      document_no: "INV-001"
      posting_date: "TODAY-150D"
      line_no: 10000
      type: "G/L Account"
      item_no: "54000"  # This is the purchase_type_no - the account historically chosen
      description: "Item description"
```

## How It Works

1. The application reads your uploaded YAML files
2. For each selected test scenario:
   - It constructs a prompt with the GL accounts, vendors, and test information
   - If historical data is included, it adds that context with the `item_no` field indicating historical account choices
   - The prompt is sent to Azure OpenAI
   - The AI responds with CSV-formatted results matching invoice lines to GL accounts
3. Results are aggregated and displayed inline
4. You can download the combined results as a CSV file

## Technical Stack

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Azure OpenAI (via openai package)**: AI-powered matching
- **js-yaml**: YAML file parsing

## Project Structure

```
invoice-tester/
├── src/
│   ├── App.tsx              # Main application component
│   ├── types.ts             # TypeScript type definitions
│   ├── services/
│   │   └── openaiService.ts # Azure OpenAI integration
│   └── utils/
│       └── fileUtils.ts     # File reading and CSV utilities
├── public/
├── package.json
└── README.md
```

## Troubleshooting

### Build Errors

If you encounter TypeScript errors, ensure all dependencies are installed:
```bash
npm install
```

### API Errors

- Verify your Azure OpenAI endpoint and API key are correct
- Ensure your deployment name matches an existing deployment in your Azure OpenAI resource
- Check that your API key has not expired

### File Upload Issues

- Ensure files are in YAML format (`.yaml` or `.yml` extension)
- Check that YAML files have the correct structure (see Data Format section)
- Verify file encoding is UTF-8

## License

This project is part of the evaltester repository.

