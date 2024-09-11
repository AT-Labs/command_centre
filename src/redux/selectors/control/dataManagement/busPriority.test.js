import { expect } from 'chai';
import {
    getDataManagementState,
    getAllBusPriorityRoutes,
    getIsLoadingBusPriorityRoutes,
    getBusPriorityRoutesDatagridConfig,
    getBusPriorityIntersectionsDatagridConfig,
    getIsLoadingBusPriorityIntersections,
    getAllBusPriorityIntersections
} from './busPriority';


const mockState = state => ({
    control: {
        dataManagement: {
            ...state
        },
    },
});

const mockPageSettings = {
    busPriority: {
        priorityRoutes: [],
        isPriorityRoutesLoading: false,
        priorityRoutesDatagridConfig: {
            columns: [],
            page: 0,
            pageSize: 100,
            sortModel: [],
            density: 'standard',
            filterModel: { items: [], linkOperator: 'and' },
        },
        intersections: [],
        isIntersectionsLoading: false,
        intersectionsDatagridConfig: {
            columns: [],
            page: 0,
            pageSize: 100,
            sortModel: [],
            density: 'standard',
            filterModel: { items: [], linkOperator: 'and' },
        },
    },
};

describe('Bus Priority Selector', () => {
    context('Priority routes', () => {
        it('should return priority routes array', () => {
            expect(getAllBusPriorityRoutes(mockState(mockPageSettings))).to.deep.equal([]);
        });

        it('should return boolean for isloading', () => {
            expect(getIsLoadingBusPriorityRoutes(mockState(mockPageSettings))).to.deep.equal(false);
        });

        it('should return data grid settings', () => {
            const expectedResult = {
                    columns: [],
                    page: 0,
                    pageSize: 100,
                    sortModel: [],
                    density: 'standard',
                    filterModel: { items: [], linkOperator: 'and' },
            };

            expect(getBusPriorityRoutesDatagridConfig(mockState(mockPageSettings))).to.deep.equal(expectedResult);
        });

        it('should return main data management state', () => {
            expect(getDataManagementState(mockState(mockPageSettings))).to.deep.equal(mockPageSettings);
        });
    });

    context('Intersections', () => {
        it('should return intersections array', () => {
            expect(getAllBusPriorityIntersections(mockState(mockPageSettings))).to.deep.equal([]);
        });

        it('should return boolean for isloading', () => {
            expect(getIsLoadingBusPriorityIntersections(mockState(mockPageSettings))).to.deep.equal(false);
        });

        it('should return data grid settings', () => {
            const expectedResult = {
                    columns: [],
                    page: 0,
                    pageSize: 100,
                    sortModel: [],
                    density: 'standard',
                    filterModel: { items: [], linkOperator: 'and' },
            };

            expect(getBusPriorityIntersectionsDatagridConfig(mockState(mockPageSettings))).to.deep.equal(expectedResult);
        });
    });
});