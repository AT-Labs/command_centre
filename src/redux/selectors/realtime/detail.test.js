import { expect } from 'chai';

import { getShapes } from './detail';
import VIEW_TYPE from '../../../types/view-types';

const wktA = 'LINESTRING(3 4,10 50,20 25)';
const wktB = 'LINESTRING(3 4)';
const coordinatesA = [[4, 3], [50, 10], [25, 20]];
const coordinatesB = [[4, 3]];

describe('Detail selectors', () => {
    context('when selecting shape', () => {
        it('should select routes for stop', () => {
            const routesByStopShape = [{ shape_wkt: wktA }, { shape_wkt: wktB }];
            const shapes = getShapes.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.STOP, routesByStopShape, []);
            expect(shapes).to.eql([coordinatesA, coordinatesB]);
        });
        it('should select one route for vehicle', () => {
            const shapes = getShapes.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.VEHICLE, [], wktA);
            expect(shapes).to.eql([coordinatesA]);
        });
        it('should select routes for selected route', () => {
            const routesByRoute = [{ shape_wkt: wktA }, { shape_wkt: wktB }];
            const shapes = getShapes.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.ROUTE, [], [], routesByRoute);

            expect(shapes).to.eql([coordinatesA, coordinatesB]);
        });
        it('should handle empty shapes cases', () => {
            /* eslint-disable no-unused-expressions */
            expect(getShapes.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.VEHICLE, [], undefined, [])).to.be.empty;

            expect(getShapes.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.STOP, [], undefined, [])).to.be.empty;

            expect(getShapes.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.ROUTE, [], undefined, [])).to.be.empty;
            expect(getShapes.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.ROUTE, [], undefined, undefined)).to.be.empty;
            /* eslint-enable no-unused-expressions */
        });
    });
});
