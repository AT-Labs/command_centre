import Dexie from 'dexie';
import _ from 'lodash-es';
import moment from 'moment';
import schemas from './schemas';

const cache = new Dexie('command-centre-cache-db');

export default cache;

_.forEach(schemas, (val) => {
    cache.version(val.version)
        .stores(val.schema)
        .upgrade(db => Promise.all([
            db.routes.clear(),
            db.stops.clear(),
            db.route_mappings.clear(),
        ]));
});

export const getCurrentVersion = () => cache.published_version.get({ version_name: 'current' });
export const getLatestVersion = () => ({ version: moment().format('YYYYMMDD') });

export const isCacheValid = tableName => Promise.all([
    cache[tableName].count(),
    getCurrentVersion(),
])
    .then(([count, cachedVersion]) => {
        const latestVersion = getLatestVersion();
        const latestVersionValue = latestVersion.version;
        if (!count || !cachedVersion || cachedVersion.version !== latestVersionValue) {
            cache.published_version.put({ ...latestVersion, version_name: 'current' });
            return { isValid: false, validVersion: latestVersionValue };
        }

        const cachedVersionValue = cachedVersion.version;
        return { isValid: cachedVersionValue === latestVersionValue, validVersion: latestVersionValue };
    });
