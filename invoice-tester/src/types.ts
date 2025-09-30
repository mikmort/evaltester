export interface TestScenario {
  name: string;
  description: string;
  vendor: string;
  line_items: LineItem[];
  expected_data?: ExpectedData[];
}

export interface LineItem {
  line_id: number;
  description: string;
  amount?: number;
}

export interface ExpectedData {
  line_id: number;
  account_id: string;
}

export interface Vendor {
  vendorNo: string;
  name: string;
  address?: string;
  city?: string;
  postCode?: string;
  countryCode?: string;
  vatId?: string;
}

export interface GLAccount {
  account_id: string;
  name: string;
  indentation: number;
  account_posting_type: string;
  account_category: string;
  account_subcategory: string;
}

export interface HistoricalData {
  vendor_no: string;
  document_no: string;
  posting_date: string;
  line_no: number;
  type: string;
  item_no: string;
  description: string;
  quantity: number;
  unit_of_measure_code: string;
}

export interface TestResult {
  test_no: string;
  line_no: number;
  description: string;
  predicted_account_id: string;
}
