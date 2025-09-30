import { AzureOpenAI } from 'openai';
import type { TestScenario, GLAccount, Vendor, HistoricalData } from '../types';

export interface OpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
}

export const callOpenAI = async (
  config: OpenAIConfig,
  testScenario: TestScenario,
  glAccounts: GLAccount[],
  vendors: Vendor[],
  historicalData?: HistoricalData[],
  chatInstructions?: string
): Promise<string> => {
  const client = new AzureOpenAI({
    endpoint: config.endpoint,
    apiKey: config.apiKey,
    apiVersion: '2024-08-01-preview',
  });

  // Build the prompt
  let prompt = `You are an accounting professional helping to match invoice lines to GL accounts.\n\n`;
  
  prompt += `## Chart of Accounts (GL Accounts):\n`;
  prompt += `\`\`\`yaml\n`;
  prompt += glAccounts.map(acc => 
    `- account_id: ${acc.account_id}\n  name: ${acc.name}\n  account_posting_type: ${acc.account_posting_type}`
  ).join('\n');
  prompt += `\n\`\`\`\n\n`;

  prompt += `## Vendors:\n`;
  prompt += `\`\`\`yaml\n`;
  prompt += vendors.map(vendor => 
    `- vendorNo: ${vendor.vendorNo}\n  name: ${vendor.name}`
  ).join('\n');
  prompt += `\n\`\`\`\n\n`;

  if (historicalData && historicalData.length > 0) {
    prompt += `## Historical Data:\n`;
    prompt += `This is historical data showing past account selections. The 'item_no' field indicates the account number (purchase_type_no) chosen historically.\n`;
    prompt += `\`\`\`yaml\n`;
    prompt += historicalData.map(hist => 
      `- vendor_no: ${hist.vendor_no}\n  description: ${hist.description}\n  item_no: ${hist.item_no}\n  posting_date: ${hist.posting_date}`
    ).join('\n');
    prompt += `\n\`\`\`\n\n`;
  }

  if (chatInstructions) {
    prompt += `## Instructions:\n${chatInstructions}\n\n`;
  }

  prompt += `## Test Scenario:\n`;
  prompt += `Test: ${testScenario.name}\n`;
  prompt += `Description: ${testScenario.description}\n`;
  prompt += `Vendor: ${testScenario.vendor}\n\n`;
  prompt += `Line Items:\n`;
  testScenario.line_items.forEach(item => {
    prompt += `- line_id: ${item.line_id}\n  description: ${item.description}\n`;
  });

  prompt += `\n\nPlease return a CSV with the following format:\n`;
  prompt += `test_no,line_no,description,predicted_account_id\n\n`;
  prompt += `For each line item, determine the best matching GL account ID. Return ONLY the CSV content with no markdown fences or additional text.`;

  try {
    const result = await client.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an accounting professional assistant that helps match invoice lines to GL accounts. Always return results in CSV format as specified.' },
        { role: 'user', content: prompt }
      ],
      model: config.deploymentName,
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = result.choices[0]?.message?.content || '';
    
    // Clean up the response to extract just the CSV content
    let csvContent = response.trim();
    
    // Remove markdown code fences if present
    csvContent = csvContent.replace(/^```(?:csv)?\n?/gm, '');
    csvContent = csvContent.replace(/\n?```$/gm, '');
    
    return csvContent;
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    throw error;
  }
};
