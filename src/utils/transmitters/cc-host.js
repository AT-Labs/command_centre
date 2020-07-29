export const getSiteStatus = () => fetch('/status.json', { method: 'GET' }).then((response) => {
    if (response.ok) {
        if (response.status === 200) {
            return response.json();
        }
    }
    return null;
}).then((siteStatus) => {
    if (siteStatus) { return siteStatus.maintenance; }
    return false;
}).catch(() => false);
