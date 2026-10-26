const { setNodeEnv, handleError } = require('./utils')

module.exports = function(cli) {
  cli
    .command('[app-path]', 'Run the application in dev mode', {
      ignoreOptionDefaultValue: true
    })
    .alias('dev')
    .option('--lazy', 'Enable lazy page compilation')
    .option('--port <port>', 'Server port', { default: 3000 })
    .option('--host <host>', 'Server host', { default: '0.0.0.0' })
    .option('--inspect-webpack', 'Inspect webpack config in your editor')
    .option('--no-cache', 'Disable cache')
    .option('--no-browser-indicator', 'Disable compiling indicator in browser')
    .action(
      handleError((cwd = '.', options) => {
        setNodeEnv('development')

        const { host, port, lazy, cache, browserIndicator } = options
        delete options.host
        delete options.port
        delete options.lazy
        delete options.cache
        delete options.browserIndicator
        return require('..')
          .createSaber(Object.assign({ cwd, dev: true }, options), {
            server: {
              host,
              port
            },
            build: {
              lazy,
              cache,
              browserIndicator
            }
          })
          .serve()
      })
    )
}
