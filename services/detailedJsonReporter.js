/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

class DetailedJsonReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig
    this._options = options || {}
  }

  onRunComplete(contexts, results) {
    // Format timestamp agar tidak mengandung karakter yang tidak valid di Windows
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    const reportDir = path.resolve(__dirname, 'detailed-report')

    // Buat folder reports jika belum ada
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    // Ekstrak stack trace penuh dari pesan error
    const extractFullStackTrace = (message) => {
      if (!message) return []
      return message.split('\n')
    }

    // Kumpulkan detail errors untuk debugging
    const errorsCollection = []
    results.testResults.forEach((testFile) => {
      testFile.testResults.forEach((test) => {
        if (test.status === 'failed') {
          errorsCollection.push({
            testFilePath: testFile.testFilePath,
            testName: test.fullName || test.title,
            duration: test.duration,
            failureMessages: test.failureMessages.map(extractFullStackTrace),
            ancestorTitles: test.ancestorTitles || [],
            status: test.status,
          })
        }
      })
    })

    // Analisis pola kegagalan
    const errorPatterns = {}
    errorsCollection.forEach((error) => {
      error.failureMessages.forEach((msgLines) => {
        if (msgLines.length > 0) {
          const errorType = msgLines[0].split(':')[0]
          errorPatterns[errorType] = (errorPatterns[errorType] || 0) + 1
        }
      })
    })

    const detailedResults = {
      summary: {
        timestamp,
        totalTests: results.numTotalTests,
        passedTests: results.numPassedTests,
        failedTests: results.numFailedTests,
        pendingTests: results.numPendingTests,
        skippedTests: results.numTodoTests,
        totalTestSuites: results.numTotalTestSuites,
        passedTestSuites: results.numPassedTestSuites,
        failedTestSuites: results.numFailedTestSuites,
        executionTime: `${(results.testResults.reduce((acc, test) => acc + test.perfStats.runtime, 0) / 1000).toFixed(2)}s`,
        startTime: new Date(results.startTime).toISOString(),
        endTime: new Date(
          results.startTime +
            results.testResults.reduce(
              (acc, test) => acc + test.perfStats.runtime,
              0
            )
        ).toISOString(),
        errorPatterns,
      },
      testFiles: results.testResults.map((testFile) => ({
        filePath: testFile.testFilePath,
        relativePath: path.relative(process.cwd(), testFile.testFilePath),
        status: testFile.status,
        numFailingTests: testFile.numFailingTests,
        numPassingTests: testFile.numPassingTests,
        numPendingTests: testFile.numPendingTests,
        perfStats: {
          runtime: testFile.perfStats.runtime,
          slowest: testFile.perfStats.slow,
          startTime: new Date(testFile.perfStats.start).toISOString(),
          endTime: new Date(testFile.perfStats.end).toISOString(),
        },
        coverage: testFile.coverage,
        testResults: testFile.testResults.map((test) => ({
          title: test.title,
          fullName: test.fullName,
          ancestorTitles: test.ancestorTitles || [],
          status: test.status,
          duration: test.duration,
          failureDetails:
            test.status === 'failed'
              ? {
                  failureMessages: test.failureMessages.map(
                    extractFullStackTrace
                  ),
                  // Tambahkan informasi location jika tersedia
                  location: test.location || null,
                }
              : null,
        })),
      })),
      errors: errorsCollection,
      // Informasi snapshot jika tersedia
      snapshots: {
        total: results.snapshot.total,
        matched: results.snapshot.matched,
        added: results.snapshot.added,
        updated: results.snapshot.updated,
        unmatched: results.snapshot.unmatched,
        unchecked: results.snapshot.unchecked,
        filesAdded: results.snapshot.filesAdded,
        filesRemoved: results.snapshot.filesRemoved,
        filesUnmatched: results.snapshot.filesUnmatched,
        filesUpdated: results.snapshot.filesUpdated,
      },
    }

    // Simpan hasil laporan ke file JSON dengan format nama baru
    const reportPath = path.join(
      reportDir,
      `TRPD-${timestamp}.json`
    )
    try {
      fs.writeFileSync(reportPath, JSON.stringify(detailedResults, null, 2))
      console.log(`Detailed test report saved to: ${reportPath}`)
    } catch (error) {
      console.error(`Error writing detailed report to file: ${error.message}`)
    }

    // Buat laporan summary yang lebih ringkas untuk tampilan konsol
    const summaryReport = {
      timestamp,
      totalTests: results.numTotalTests,
      passedTests: results.numPassedTests,
      failedTests: results.numFailedTests,
      executionTime: `${(results.testResults.reduce((acc, test) => acc + test.perfStats.runtime, 0) / 1000).toFixed(2)}s`,
      errorPatterns,
      failedTestNames: errorsCollection.map((err) => err.testName),
    }

    console.log('\nTest Report Summary:')
    console.log(JSON.stringify(summaryReport, null, 2))
  }
}

module.exports = DetailedJsonReporter
