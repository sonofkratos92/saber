const { validateConfig } = require('../../../dist/utils/validateConfig')

test('build.browserIndicator defaults to true and can be disabled', () => {
  const defaultConfig = validateConfig({}, { dev: true })
  expect(defaultConfig.build.browserIndicator).toBe(true)

  const disabledConfig = validateConfig(
    {
      build: {
        browserIndicator: false
      }
    },
    { dev: true }
  )
  expect(disabledConfig.build.browserIndicator).toBe(false)
})
