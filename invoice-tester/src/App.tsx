import { useState } from 'react'
import './App.css'
import { readFileAsText, parseYaml, downloadCSV } from './utils/fileUtils'
import { callOpenAI } from './services/openaiService'
import type { OpenAIConfig } from './services/openaiService'
import type { TestScenario, GLAccount, Vendor, HistoricalData } from './types'

function App() {
  const [testScenariosFile, setTestScenariosFile] = useState<File | null>(null)
  const [glAccountsFile, setGlAccountsFile] = useState<File | null>(null)
  const [vendorsFile, setVendorsFile] = useState<File | null>(null)
  const [historicalFile, setHistoricalFile] = useState<File | null>(null)
  const [chatInstructionsFile, setChatInstructionsFile] = useState<File | null>(null)
  const [includeHistorical, setIncludeHistorical] = useState(false)
  
  const [endpoint, setEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [deploymentName, setDeploymentName] = useState('')
  
  const [results, setResults] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [availableTests, setAvailableTests] = useState<TestScenario[]>([])

  const handleTestScenariosUpload = async (file: File) => {
    setTestScenariosFile(file)
    try {
      const content = await readFileAsText(file)
      const data = parseYaml(content)
      if (data.tests) {
        setAvailableTests(data.tests)
      }
    } catch (err) {
      setError('Error parsing test scenarios file')
      console.error(err)
    }
  }

  const toggleTestSelection = (testName: string) => {
    setSelectedTests(prev => 
      prev.includes(testName) 
        ? prev.filter(t => t !== testName)
        : [...prev, testName]
    )
  }

  const selectAllTests = () => {
    setSelectedTests(availableTests.map(t => t.name))
  }

  const deselectAllTests = () => {
    setSelectedTests([])
  }

  const handleRunTests = async () => {
    if (!testScenariosFile || !glAccountsFile || !vendorsFile) {
      setError('Please upload test scenarios, GL accounts, and vendors files')
      return
    }

    if (!endpoint || !apiKey || !deploymentName) {
      setError('Please provide Azure OpenAI configuration')
      return
    }

    if (selectedTests.length === 0) {
      setError('Please select at least one test scenario')
      return
    }

    setLoading(true)
    setError('')
    setResults('')

    try {
      // Read and parse files
      const testScenariosContent = await readFileAsText(testScenariosFile)
      const testScenariosData = parseYaml(testScenariosContent)

      const glAccountsContent = await readFileAsText(glAccountsFile)
      const glAccountsData = parseYaml(glAccountsContent)

      const vendorsContent = await readFileAsText(vendorsFile)
      const vendorsData = parseYaml(vendorsContent)

      let historicalData: HistoricalData[] | undefined
      if (includeHistorical && historicalFile) {
        const historicalContent = await readFileAsText(historicalFile)
        const historicalDataParsed = parseYaml(historicalContent)
        historicalData = historicalDataParsed.test_setup?.historicalPurchaseLinesToCreate || []
      }

      let chatInstructions: string | undefined
      if (chatInstructionsFile) {
        chatInstructions = await readFileAsText(chatInstructionsFile)
      }

      const config: OpenAIConfig = {
        endpoint,
        apiKey,
        deploymentName,
      }

      const glAccounts: GLAccount[] = glAccountsData.test_setup?.glAccountsToCreate || []
      const vendors: Vendor[] = vendorsData.test_setup?.vendorsToCreate || []
      const tests: TestScenario[] = testScenariosData.tests || []

      // Filter to selected tests
      const testsToRun = tests.filter(t => selectedTests.includes(t.name))

      let allResults: string[] = []

      // Run tests sequentially
      for (const test of testsToRun) {
        const result = await callOpenAI(
          config,
          test,
          glAccounts,
          vendors,
          historicalData,
          chatInstructions
        )
        
        // Parse and collect results (skip header for subsequent tests)
        const lines = result.split('\n').filter(line => line.trim())
        if (allResults.length === 0) {
          allResults.push(...lines)
        } else {
          // Skip header line for subsequent results
          allResults.push(...lines.slice(1))
        }
      }

      const finalResults = allResults.join('\n')
      setResults(finalResults)
    } catch (err: any) {
      setError(`Error running tests: ${err.message || 'Unknown error'}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (results) {
      downloadCSV(results, 'test_results.csv')
    }
  }

  return (
    <div className="app">
      <h1>Invoice Matching Test Runner</h1>
      
      <div className="config-section">
        <h2>Azure OpenAI Configuration</h2>
        <div className="form-group">
          <label>Endpoint:</label>
          <input 
            type="text" 
            value={endpoint} 
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://your-resource.openai.azure.com/"
          />
        </div>
        <div className="form-group">
          <label>API Key:</label>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your API Key"
          />
        </div>
        <div className="form-group">
          <label>Deployment Name:</label>
          <input 
            type="text" 
            value={deploymentName} 
            onChange={(e) => setDeploymentName(e.target.value)}
            placeholder="gpt-4"
          />
        </div>
      </div>

      <div className="upload-section">
        <h2>Upload Files</h2>
        
        <div className="form-group">
          <label>Test Scenarios (required - *testscenarios*.yaml):</label>
          <input 
            type="file" 
            accept=".yaml,.yml"
            onChange={(e) => e.target.files?.[0] && handleTestScenariosUpload(e.target.files[0])}
          />
          {testScenariosFile && <span className="file-name">✓ {testScenariosFile.name}</span>}
        </div>

        <div className="form-group">
          <label>GL Accounts (required - *glaccounts*.yaml):</label>
          <input 
            type="file" 
            accept=".yaml,.yml"
            onChange={(e) => e.target.files?.[0] && setGlAccountsFile(e.target.files[0])}
          />
          {glAccountsFile && <span className="file-name">✓ {glAccountsFile.name}</span>}
        </div>

        <div className="form-group">
          <label>Vendors (required - *vendors*.yaml):</label>
          <input 
            type="file" 
            accept=".yaml,.yml"
            onChange={(e) => e.target.files?.[0] && setVendorsFile(e.target.files[0])}
          />
          {vendorsFile && <span className="file-name">✓ {vendorsFile.name}</span>}
        </div>

        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={includeHistorical}
              onChange={(e) => setIncludeHistorical(e.target.checked)}
            />
            Include Historical Data
          </label>
        </div>

        {includeHistorical && (
          <div className="form-group">
            <label>Historical Data (optional - *historical*.yaml):</label>
            <input 
              type="file" 
              accept=".yaml,.yml"
              onChange={(e) => e.target.files?.[0] && setHistoricalFile(e.target.files[0])}
            />
            {historicalFile && <span className="file-name">✓ {historicalFile.name}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Chat Instructions (optional - ChatTest.md):</label>
          <input 
            type="file" 
            accept=".md,.txt"
            onChange={(e) => e.target.files?.[0] && setChatInstructionsFile(e.target.files[0])}
          />
          {chatInstructionsFile && <span className="file-name">✓ {chatInstructionsFile.name}</span>}
        </div>
      </div>

      {availableTests.length > 0 && (
        <div className="test-selection">
          <h2>Select Test Scenarios</h2>
          <div className="selection-controls">
            <button onClick={selectAllTests}>Select All</button>
            <button onClick={deselectAllTests}>Deselect All</button>
            <span>{selectedTests.length} of {availableTests.length} selected</span>
          </div>
          <div className="test-list">
            {availableTests.map(test => (
              <div key={test.name} className="test-item">
                <label>
                  <input 
                    type="checkbox"
                    checked={selectedTests.includes(test.name)}
                    onChange={() => toggleTestSelection(test.name)}
                  />
                  <strong>{test.name}</strong> - {test.description}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="actions">
        <button 
          onClick={handleRunTests} 
          disabled={loading || !testScenariosFile || !glAccountsFile || !vendorsFile || selectedTests.length === 0}
          className="run-button"
        >
          {loading ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="results-section">
          <h2>Results</h2>
          <div className="results-controls">
            <button onClick={handleDownloadCSV} className="download-button">
              Download as CSV
            </button>
          </div>
          <pre className="results-display">{results}</pre>
        </div>
      )}
    </div>
  )
}

export default App
