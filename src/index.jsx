import { runWithAdal } from 'react-adal';
import { getAuthContext, IS_LOGIN_NOT_REQUIRED } from './auth';

const { VERSION } = process.env;
function loadApp() {
    // const appJs = document.createElement('script');
    // appJs.src = `/static/js/app.${VERSION}.js`;
    // appJs.crossOrigin = 'use-credentials';
    // appJs.type = 'text/javascript';
    // document.body.appendChild(appJs);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); // eslint-disable-line
}
(function checkVersion() {
    const headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache, no-store');

    fetch('/version.txt', { cache: 'no-cache', redirect: 'follow', headers })
        .then((response) => {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(new Error('Failed to fatch Version'));
        })
        .then((text) => {
            if (text !== VERSION) {
                // TODO: use existing styled Banner to show this
                // eslint-disable-next-line no-alert
                const r = window.confirm('A new version is found, click OK to refresh now or cancel to reload the page later');
                if (r === true) {
                    window.location.reload();
                }
                return true;
            }
            return false;
        })
        .then((stopChecking) => {
            if (!stopChecking) {
                sleep(1000 * 60).then(checkVersion);
            }
        })
        .catch(() => sleep(1000 * 60).then(checkVersion));
}());
runWithAdal(getAuthContext(), loadApp, IS_LOGIN_NOT_REQUIRED);
