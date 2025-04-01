/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

/**
 * Reporter khusus untuk Playwright E2E testing
 * Mirip dengan SimpleJsonReporter untuk Jest
 */
class PlaywrightReporter {
  constructor(options) {
    this.options = options || {}
    this.outputDir = path.resolve(__dirname, 'e2e-reports')
    console.log(`[Playwright Reporter] Output directory: ${this.outputDir}`)

    // Buat folder e2e-reports jika belum ada
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
      console.log(
        `[Playwright Reporter] Created output directory: ${this.outputDir}`
      )
    }

    // Menyimpan data test sementara
    this.testData = {
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      testResults: [],
    }
  }

  // Dipanggil saat test dimulai
  onBegin(config, suite) {
    console.log(
      `[Playwright Reporter] Starting the run with ${suite.allTests().length} tests`
    )
  }

  // Dipanggil saat test selesai
  onEnd(result) {
    console.log(
      `[Playwright Reporter] Test run completed. Processing results...`
    )

    try {
      // Format timestamp agar tidak mengandung karakter yang tidak valid di Windows
      const timestamp = new Date().toISOString().replace(/:/g, '-')
      const reportPath = path.join(
        this.outputDir,
        `e2e-report-${timestamp}.json`
      )
      console.log(`[Playwright Reporter] Will save report to: ${reportPath}`)

      // Buat ringkasan hasil testing
      const summary = {
        timestamp,
        environment: process.env.NODE_ENV || 'development',
        passed: this.testData.passed,
        failed: this.testData.failed,
        skipped: this.testData.skipped,
        flaky: this.testData.flaky,
        total:
          this.testData.passed +
          this.testData.failed +
          this.testData.skipped +
          this.testData.flaky,
        executionTime: result.duration,
        testResults: this.testData.testResults,
      }

      console.log(
        `[Playwright Reporter] Summary data prepared. Writing to file...`
      )
      console.log(
        `[Playwright Reporter] Test statistics: Passed=${summary.passed}, Failed=${summary.failed}, Total=${summary.total}`
      )

      // Simpan hasil ringkasan ke file JSON
      fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2))
      console.log(
        `[Playwright Reporter] E2E test report saved to: ${reportPath}`
      )
    } catch (error) {
      console.error(
        `[Playwright Reporter] Error writing report to file: ${error.message}`
      )
      console.error(error.stack)
    }
  }

  // Dipanggil saat setiap test selesai
  onTestEnd(test, result) {
    try {
      console.log(
        `[Playwright Reporter] Test completed: "${test.title}" with status "${result.status}"`
      )

      // Simpan hasil test
      const testEntry = {
        title: test.title,
        file: test.location.file,
        status: result.status,
        duration: result.duration,
        retry: test.retry,
      }

      // Tambahkan failure messages jika test gagal
      if (result.status === 'failed' || result.status === 'timedOut') {
        this.testData.failed++

        // Tambahkan error message jika ada
        if (result.error) {
          testEntry.failureMessages = [
            result.error.message.split('\n')[0], // Ambil baris pertama saja
          ]
        }
      } else if (result.status === 'passed') {
        this.testData.passed++
      } else if (result.status === 'skipped') {
        this.testData.skipped++
      } else if (result.status === 'interrupted') {
        this.testData.failed++
        testEntry.failureMessages = ['Test was interrupted']
      }

      // Tambahkan ke daftar hasil test
      this.testData.testResults.push(testEntry)
    } catch (error) {
      console.error(
        `[Playwright Reporter] Error in onTestEnd: ${error.message}`
      )
      console.error(error.stack)
    }
  }

  // Dipanggil saat setiap test step selesai - tidak digunakan tetapi perlu implementasi
  onStepEnd() {
    // Opsional: tambahkan logging untuk step jika diperlukan
  }

  // Dipanggil saat terjadi error pada test
  onError(error) {
    console.error(
      `[Playwright Reporter] Error during test execution: ${error.message}`
    )
  }
}

module.exports = PlaywrightReporter
