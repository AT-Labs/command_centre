import { expect } from 'chai';
import sinon from 'sinon';
import moment from 'moment';

import * as cache from './cache';

let sandbox;
const currentVersion = {
    version: moment().format('YYYYMMDD'),
    version_name: 'current',
};

describe('Cache', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });

    afterEach(() => sandbox.restore());

    const fakedVersion = () => sandbox.fake.resolves(currentVersion);

    context('isCacheValid', () => {
        const fakedCount = count => sandbox.fake.resolves(count);

        it('Should return valid version', async () => {
            cache.default.routes.count = fakedCount(1984);
            cache.default.published_version.get = fakedVersion();
            cache.default.stops.count = fakedCount(1984);
            cache.default.route_mappings.count = fakedCount(1984);

            const isCacheValid = await cache.isCacheValid();
            expect(isCacheValid.isValid).to.equal(true);
            expect(isCacheValid.validVersion).to.eql(currentVersion.version);
        });

        it('Should return not valid version when there is not data', async () => {
            cache.default.routes.count = fakedCount(undefined);
            cache.default.published_version.get = fakedVersion();
            cache.default.stops.count = fakedCount(1984);
            cache.default.route_mappings.count = fakedCount(1984);

            const isCacheValid = await cache.isCacheValid();
            expect(isCacheValid.isValid).to.equal(false);
            expect(isCacheValid.validVersion).to.eql(currentVersion.version);
        });
    });
});
