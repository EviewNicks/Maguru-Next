/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

class SimpleJsonReporter {
  onRunComplete(contexts, results) {
    // Format timestamp agar tidak mengandung karakter yang tidak valid di Windows (misalnya ':')
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    const reportDir = path.resolve(__dirname, 'reports')

    // Buat folder reports jika belum ada
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const simpleResults = {
      timestamp,
      environment: process.env.NODE_ENV || 'development',
      numFailedTests: results.numFailedTests,
      numPassedTests: results.numPassedTests,
      numTotalTests: results.numTotalTests,
      executionTime: `${results.startTime}ms`,
      testResults: results.testResults.map((test) => ({
        filePath: test.testFilePath,
        status: test.status,
        failureMessages: test.failureMessages
          ? test.failureMessages.map((msg) => msg.split('\n')[0])
          : [],
        testResults: test.testResults
          ? test.testResults.map((testCase) => ({
              title: testCase.title,
              status: testCase.status,
              duration: testCase.duration,
              failureMessages: testCase.failureMessages
                ? testCase.failureMessages.map((msg) => msg.split('\n')[0])
                : [],
            }))
          : [],
      })),
    }

    // Simpan hasil ringkasan ke file JSON dengan timestamp
    const reportPath = path.join(reportDir, `test-report-${timestamp}.json`)
    try {
      fs.writeFileSync(reportPath, JSON.stringify(simpleResults, null, 2))
      console.log(`Test report saved to: ${reportPath}`)
    } catch (error) {
      console.error(`Error writing report to file: ${error.message}`)
    }
  }
}

module.exports = SimpleJsonReporter
