# Chat Test Instructions: Invoice Line → GL Account Mapping

Goal: Given a company-specific dataset (vendors, chart of accounts, historical invoice lines, and optional structural policy file), produce a CSV mapping each invoice test line to the most appropriate GL account. The response MUST be raw CSV so it can be directly downloaded (no markdown fences, no prose) and use the updated column schema including a per-line identifier.

Required:
1. Vendors: `<Company_Name>_vendors.yaml`
2. Chart of Accounts: `<Company_Name>_glaccounts.yaml`
3. Invoice / Historical Lines: `<Company_Name>_historical_large.yaml` (or provided test invoice set)

Optional (if present):
4. Structural Policy: `<Company_Name>_policy.md` (capitalization, classification, timing policies; NO vendor/keyword micro-rules)

## 1. Output
Produce a CSV (UTF-8, no BOM) with header:
`test_no,line_no,description,predicted_account_id`

Where (STRICT PRESERVATION RULES APPLY):
- `test_no` = the test scenario identifier EXACTLY AS IT APPEARS in the source data. Do not rename, re‑case, trim internal spacing, drop prefixes, or zero‑pad / unpad. If the YAML (or other source) has a `test_no` field, use its raw textual value verbatim. If there is no `test_no` field but there is a `name`, use the `name` value verbatim (even if it contains dashes, mixed case, or embedded numbers). Only generate a synthetic sequential integer (starting at 1) if neither `test_no` nor `name` exists.
- `line_no` = the original line identifier (e.g., `line_id`) EXACTLY AS IT APPEARS. Preserve numeric width (e.g., keep 10000, don't convert to 10000.0 or 10,000), preserve string form if it is alphanumeric. Only synthesize a 1‑based sequence local to that test if no line identifier of any form exists; never renumber existing IDs even if they are non‑contiguous (e.g., 10000,10020,10100 stays that way).
- `description` = the original line description trimmed of leading/trailing whitespace only; preserve internal spacing and casing. Quote if it contains a comma, double quote, or newline; escape embedded double quotes by doubling them.
- `predicted_account_id` = chosen GL account id (numeric code as appears in GL accounts file).

Do NOT include extra columns unless explicitly asked. Do NOT output explanatory prose outside the CSV. The final answer should be ONLY the CSV content so that it is directly downloadable as a CSV file.

## 2. Disallowed Choices
- Do not output Heading, Begin-Total, End-Total accounts.
- Do not invent account ids not present in the GL accounts file.
- Do not aggregate multiple lines; each line must have exactly one account id.

## 3. Minimal Confidence Handling
If uncertain (no strong keyword or vendor history), still choose a single best account guided by category inference; do not leave blank or use placeholders.

## 4. CSV Formatting Rules
- Use standard CSV with commas.
- Quote a field only if it contains a comma, quote, or newline.
- Escape embedded double quotes by doubling them.
- No trailing comma. No extra summary lines.
- First line must be the header exactly: `test_no,line_no,description,predicted_account_id`.
 - Identifiers must appear verbatim (see Section 1); validation MUST treat any normalization (e.g., trimming internal double spaces, altering case, dropping prefixes like "FrenchFranks-") as an error.

## 4A. Identifier Preservation Validation
Before returning the CSV, ensure:
1. Every emitted `test_no` value exists verbatim in the set of source `test_no` or `name` fields (unless synthetic numbering was required due to total absence of both fields in a test definition).
2. No synthetic numbering is mixed with real identifiers within the same source file—either all tests had identifiers, or only the absent ones received sequential numbers.
3. All original `line_id` (or equivalent) values are present and unchanged; count of rows for a test equals its count of original line items.
4. No leading zeros were added or removed from identifiers that originally contained them.

## 5. Example (Illustrative Only)
Input line: test_no=41, line_no=10000, description="Electric utility" → predicted_account_id=53100
CSV row: `41,10000,Electric utility,53100`

## 6. Final Answer Format
Return ONLY the CSV content (header + rows). No markdown fences, no narrative, no code block syntax. Ensure the first line is the exact header `test_no,line_no,description,predicted_account_id` so a client can download the raw response as a CSV file with correct columns.

---
End of instructions.

