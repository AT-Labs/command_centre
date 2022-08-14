import { runWithAdal } from 'react-adal';
import { getAuthContext, IS_LOGIN_NOT_REQUIRED } from './auth';

let localVersion;
function loadApp() { }
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); // eslint-disable-line
}
(function checkVersion() {
    const headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache, no-store');

    fetch('/version.json', { cache: 'no-cache', redirect: 'follow', headers })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(new Error('Failed to fatch Version'));
        })
        .then((versionObj) => {
            const version = versionObj.releaseVersion;
            if (!localVersion) {
                localVersion = version;
            } else if (version !== localVersion) {
                // TODO: use existing styled Banner to show this
                // eslint-disable-next-line no-alert
                const r = window.confirm(`A new version ${version} is found, click OK to refresh now or cancel to reload the page later`);
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
