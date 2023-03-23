import Dexie from 'dexie';
import { forEach } from 'lodash-es';
import moment from 'moment';
import schemas from './schemas';

const cache = new Dexie('command-centre-cache-db');

export default cache;

forEach(schemas, (val) => {
    cache.version(val.version)
        .stores(val.schema)
        .upgrade(db => Promise.all([
            db.routes.clear(),
        ]));
});

export const getCurrentVersion = () => cache.published_version.get({ version_name: 'current' });
export const getLatestVersion = () => ({ version: moment().format('YYYYMMDD') });

export const isCacheValid = async () => Promise.all([getCurrentVersion(), cache.routes.count()])
    .then(([cachedVersion, routesCount]) => {
        const latestVersion = getLatestVersion();
        const latestVersionValue = latestVersion.version;
        if (!routesCount || !cachedVersion || cachedVersion.version !== latestVersionValue) {
            cache.published_version.put({ ...latestVersion, version_name: 'current' });
            return { isValid: false, validVersion: latestVersionValue };
        }
        return { isValid: cachedVersion.version === latestVersionValue, validVersion: latestVersionValue };
    });
