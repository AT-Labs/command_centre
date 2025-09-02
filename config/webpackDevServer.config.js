const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const config = require('./webpack.config.dev');
const paths = require('./paths');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';

module.exports = function(port, proxy, allowedHost) {
    return {
        client: {
            overlay: false,
            logging: 'none',
        },
        allowedHosts: 'all',
        compress: true,
        hot: true,
        static: {
            publicPath: config.output.publicPath,
            //contentBase: paths.appPublic,
            //watchContentBase: true,
            watch: {
                ignored: ignoredFiles(paths.appSrc),
            },
        },
        https: protocol === 'https',
        host,
        port,
        historyApiFallback: {
            // Paths with dots should still use the history fallback.
            // See https://github.com/facebookincubator/create-react-app/issues/387.
            disableDotRule: true,
        },
        proxy,
        onBeforeSetupMiddleware(devServer) {
            // This lets us open files from the runtime error overlay.
            devServer.app.use(errorOverlayMiddleware());
            // This service worker file is effectively a 'no-op' that will reset any
            // previous service worker registered for the same host:port combination.
            // We do this in development to avoid hitting the production cache if
            // it used the same host and port.
            // https://github.com/facebookincubator/create-react-app/issues/2272#issuecomment-302832432
            devServer.app.use(noopServiceWorkerMiddleware('/'));
        },
    };
};
