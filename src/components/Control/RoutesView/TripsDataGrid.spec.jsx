import React from 'react';
import { shallow } from 'enzyme';
import { TripsDataGrid, renderDisruptionIdCell } from './TripsDataGrid';

import TRIP_STATUS_TYPES from '../../../types/trip-status-types';

let wrapper;

const componentPropsMock = {
    datagridConfig: {},
    tripInstances: [],
    activeRoute: undefined,
    activeRouteVariant: undefined,
    selectedTrips: [],
    serviceDate: '2023-08-21T12:13:21+12:00',
    filters: {},
    agencies: [],
    rowCount: 0,
    allStops: {},
    vehicleAllocations: {},
    useRoutesTripsFilterCollapse: true,
    updateTripsDatagridConfig: () => {},
    selectSingleTrip: () => {},
    selectTrips: () => {},
    selectAllTrips: () => {},
    filterTripInstances: () => {},
    updateActiveTripInstances: () => {},
    mergeRouteFilters: () => { },
    updateDefaultRoutesTripsDatagridConfig: () => { },
    useRoutesTripsPreferences: false,
    useHideTrip: false,
    useAddTrip: false,
    updateRoutesTripsDatagridConfig: () => { },
    routesTripsDatagridConfig: {},
};

const setup = (customProps = {}) => {
    const props = { ...componentPropsMock, ...customProps };
    return shallow(<TripsDataGrid { ...props } />);
};

describe('TripsDataGrid', () => {
    it('Should render', () => {
        wrapper = setup();
        expect(wrapper.exists()).toEqual(true);
    });

    describe('renderDisruptionIdCell', () => {
        it('should return a link with correct href and text when disruptionId is present', () => {
            const disruptionId = 123;
            const result = renderDisruptionIdCell({ row: { disruptionId } });

            expect(result).toBeTruthy();
            expect(result.type).toBe('a');
            expect(result.props.href).toBe('/control-main-view/control-disruptions/123');
            expect(result.props.children).toBe('DISR000123');
        });

        it('should return undefined when disruptionId is null', () => {
            const result = renderDisruptionIdCell({ row: { disruptionId: null } });
            expect(result).toBeUndefined();
        });
    });

    describe('getRowClassName', () => {
        const tripStatusTestCases = [
            { status: TRIP_STATUS_TYPES.completed, expectedClassName: 'text-muted trips-data-grid__row--completed' },
            { status: TRIP_STATUS_TYPES.notStarted, expectedClassName: 'text-muted trips-data-grid__row--not-started' },
            { status: TRIP_STATUS_TYPES.cancelled, expectedClassName: 'trips-data-grid__row--cancelled' },
            { status: TRIP_STATUS_TYPES.missed, expectedClassName: 'trips-data-grid__row--missed' },
            { status: TRIP_STATUS_TYPES.inProgress, expectedClassName: 'trips-data-grid__row--in-progress' },
            { status: 'unknownStatus', expectedClassName: '' },
        ];

        beforeEach(() => {
            wrapper = setup();
        });

        tripStatusTestCases.forEach(({ status, expectedClassName }) => {
            it(`returns the correct class for ${status} trips`, () => {
                const row = { tripInstance: { status } };
                const result = wrapper.find('CustomDataGrid').prop('getRowClassName')({ row });
                expect(result).toBe(expectedClassName);
            });
        });

        it('should have type and disruptionId columns defined correctly', () => {
            wrapper = setup({
                useDiversion: true,
            });
            const columns = wrapper.find('CustomDataGrid').prop('columns');

            const typeCol = columns.find(col => col.field === 'type');
            const disruptionCol = columns.find(col => col.field === 'disruptionId');

            expect(typeCol).toBeDefined();
            expect(typeCol.headerName).toBe('Type');
            expect(typeCol.hide).toBe(true);

            expect(disruptionCol).toBeDefined();
            expect(disruptionCol.headerName).toBe('Disruption');
            expect(typeof disruptionCol.renderCell).toBe('function');
        });

        it('should render routeVariantId with a diversion icon floated right if type is detoured', () => {
            wrapper = setup({
                useDiversion: true,
            });
            const columns = wrapper.find('CustomDataGrid').prop('columns');
            const routeVariantCol = columns.find(col => col.field === 'routeVariantId');
            expect(routeVariantCol).toBeDefined();
            expect(typeof routeVariantCol.renderCell).toBe('function');

            // Simulate a row with type 'Detoured' and required fields
            const params = {
                value: 'RV123',
                row: {
                    type: 'Detoured',
                    routeVariantId: 'RV123',
                },
            };
            const cell = routeVariantCol.renderCell(params);

            // Expecting
            // <span>
            //    <span>RV123</span> <--- span 0
            //    <span><GiDetour /></span> <--- span 1
            // </span>
            expect(cell.type).toBe('span');
            const children = React.Children.toArray(cell.props.children);
            expect(children.length).toBe(2);
            expect(children[0].type).toBe('span');
            expect(children[0].props.children).toBe('RV123');
            expect(children[1].type).toBe('span');
            const icon = children[1].props.children;
            expect(icon && (icon.type.displayName || icon.type.name)).toBe('GiDetour');
        });
    });
});
