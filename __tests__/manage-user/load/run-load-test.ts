import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

// Generate tokens for testing
async function generateTestTokens() {
  console.log('Generating test tokens...')

  // Dalam implementasi nyata, ini akan memanggil Clerk API
  // Untuk sederhananya, kita gunakan environment variable yang sudah ada
  // atau generate token dummy

  if (!process.env.USER_TOKEN) {
    console.log('USER_TOKEN not found in environment, using dummy token')
    process.env.USER_TOKEN = 'test_user_token'
  }

  if (!process.env.ADMIN_TOKEN) {
    console.log('ADMIN_TOKEN not found in environment, using dummy token')
    process.env.ADMIN_TOKEN = 'test_admin_token'
  }
}

// Clear cache before testing
async function clearCache() {
  console.log('Clearing role cache...')

  try {
    await fetch('http://localhost:3000/api/test/clear-cache', {
      method: 'POST',
    })
    console.log('Cache cleared successfully')
  } catch (error) {
    console.error('Failed to clear cache:', error)
    console.log('Continuing with test anyway...')
  }
}

// Run load test with and without cache
async function runLoadTests() {
  const testDir = path.join(__dirname)
  const reportDir = path.join(testDir, 'reports')

  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  // 1. Test without cache (clear cache first)
  console.log('Running load test without cache...')
  await clearCache()

  return new Promise<void>((resolve, reject) => {
    const withoutCacheProcess = spawn(
      'npx',
      [
        'artillery',
        'run',
        '--output',
        path.join(reportDir, 'load-test-no-cache.json'),
        path.join(testDir, 'rbac-performance.yml'),
      ],
      { stdio: 'inherit' }
    )

    withoutCacheProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error(`Artillery process exited with code ${code}`)
        reject(new Error(`Artillery process exited with code ${code}`))
        return
      }

      console.log('Load test without cache completed')

      // 2. Test with cache already warmed
      console.log('Running load test with cache...')

      const withCacheProcess = spawn(
        'npx',
        [
          'artillery',
          'run',
          '--output',
          path.join(reportDir, 'load-test-with-cache.json'),
          path.join(testDir, 'rbac-performance.yml'),
        ],
        { stdio: 'inherit' }
      )

      withCacheProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Artillery process exited with code ${code}`)
          reject(new Error(`Artillery process exited with code ${code}`))
          return
        }

        console.log('Load test with cache completed')

        // 3. Generate comparison report
        console.log('Generating HTML report...')
        const reportProcess = spawn(
          'npx',
          [
            'artillery',
            'report',
            '--output',
            path.join(reportDir, 'load-test-report.html'),
            path.join(reportDir, 'load-test-with-cache.json'),
          ],
          { stdio: 'inherit' }
        )

        reportProcess.on('close', (code) => {
          if (code !== 0) {
            console.error(`Artillery report process exited with code ${code}`)
            reject(
              new Error(`Artillery report process exited with code ${code}`)
            )
            return
          }

          console.log(
            `HTML report generated at ${path.join(reportDir, 'load-test-report.html')}`
          )
          resolve()
        })
      })
    })
  })
}

// Main function
async function main() {
  try {
    await generateTestTokens()
    await runLoadTests()
    console.log(
      'Load testing completed. Check reports in __tests__/manage-user/load/reports/'
    )
  } catch (error) {
    console.error('Error during load testing:', error)
    process.exit(1)
  }
}

main()
