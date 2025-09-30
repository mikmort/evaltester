# Usage Example - Invoice Matching Test Runner

This guide walks you through using the Invoice Matching Test Runner application.

## Prerequisites

1. An Azure OpenAI resource deployed with a model (e.g., GPT-4)
2. Your Azure OpenAI endpoint URL, API key, and deployment name
3. Test data files in YAML format

## Step-by-Step Guide

### Step 1: Install and Start the Application

```bash
# Navigate to the invoice-tester directory
cd invoice-tester

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The application will open at `http://localhost:5173/`

### Step 2: Configure Azure OpenAI

In the "Azure OpenAI Configuration" section, enter:

- **Endpoint**: `https://your-resource.openai.azure.com/`
- **API Key**: Your Azure OpenAI API key
- **Deployment Name**: `gpt-4` (or your deployment name)

### Step 3: Upload Required Files

Click "Choose File" for each required field:

1. **Test Scenarios**: Upload `LarryLegal_testscenarios_standard_accuracy.yaml`
   - This file contains the test cases you want to run

2. **GL Accounts**: Upload `LarryLegal_glaccounts.yaml`
   - This file contains your chart of accounts

3. **Vendors**: Upload `LarryLegal_vendors.yaml`
   - This file contains vendor master data

### Step 4: (Optional) Include Historical Data

If you want to improve accuracy with historical data:

1. Check the "Include Historical Data" checkbox
2. Upload `LarryLegal_historical_large.yaml`
   - This file shows past account selections (the `item_no` field is the purchase_type_no)

### Step 5: (Optional) Add Chat Instructions

Upload `ChatTest.md` to provide specific instructions to the AI about how to format results and what rules to follow.

### Step 6: Select Tests to Run

After uploading the test scenarios file, a list of available tests will appear. You can:

- Check individual tests you want to run
- Click "Select All" to run all tests
- Click "Deselect All" to clear your selection

Example tests you might see:
- `LarryLegal-LineMatching-001` - Westlaw research subscription
- `LarryLegal-LineMatching-002` - LexisNexis subscription
- `LarryLegal-LineMatching-003` - RelativityOne e-discovery

### Step 7: Run the Tests

Click the "Run Tests" button. The application will:
1. Process each selected test
2. Send data to Azure OpenAI
3. Display results as they complete

### Step 8: Review Results

Results appear in CSV format below the "Run Tests" button:

```csv
test_no,line_no,description,predicted_account_id
LarryLegal-LineMatching-001,10000,Annual Westlaw Precision firmwide license (100 seats),54000
LarryLegal-LineMatching-002,10000,Lexis Practical Guidance seats (25 users) - annual term,54000
```

### Step 9: Download Results

Click the "Download as CSV" button to save the results to your computer as `test_results.csv`.

You can then open this file in Excel, Google Sheets, or any CSV-compatible application for further analysis.

## Example Output Format

The CSV output contains four columns:

| test_no | line_no | description | predicted_account_id |
|---------|---------|-------------|---------------------|
| LarryLegal-LineMatching-001 | 10000 | Annual Westlaw Precision firmwide license | 54000 |
| LarryLegal-LineMatching-002 | 10000 | Lexis Practical Guidance seats | 54000 |
| LarryLegal-LineMatching-003 | 10000 | RelativityOne hosting - 2 TB workspace | 53000 |

Where:
- `test_no` = Test scenario name (exactly as in the YAML file)
- `line_no` = Line item ID (exactly as in the YAML file)
- `description` = Invoice line description
- `predicted_account_id` = GL account number predicted by AI

## Tips

1. **Start Small**: Run 1-2 tests first to verify your configuration
2. **Use Historical Data**: Including historical data improves accuracy
3. **Check Results**: Review the predictions to ensure they make sense
4. **API Costs**: Be aware that each test makes a call to Azure OpenAI (costs may apply)
5. **Save Configuration**: Your browser may remember the configuration values

## Troubleshooting

### "Run Tests" button is disabled
- Ensure all three required files are uploaded
- Ensure at least one test is selected
- Verify Azure OpenAI configuration is complete

### API Error
- Check that your Azure OpenAI endpoint URL is correct
- Verify your API key is valid and not expired
- Ensure your deployment name matches an existing deployment

### No results appearing
- Check browser console for errors (F12 → Console)
- Verify your Azure OpenAI model is deployed and accessible
- Ensure test files are valid YAML format

### Incorrect predictions
- Try including historical data
- Upload ChatTest.md for specific instructions
- Review the GL accounts file to ensure it's complete

## Next Steps

After testing with the provided LarryLegal data, you can:

1. Create your own test scenarios
2. Use your company's GL accounts and vendors
3. Include your historical purchase data
4. Customize the chat instructions for your specific needs

Refer to the main [README.md](README.md) for more detailed information about data formats and advanced features.
