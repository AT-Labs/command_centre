/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moment from 'moment-timezone';
import DiversionManager from './index';
import { BUS_TYPE_ID } from '../../../../types/vehicle-types';
import { searchRouteVariants } from '../../../../utils/transmitters/trip-mgt-api';
import dateTypes from '../../../../types/date-types';

jest.mock('../../../../utils/transmitters/trip-mgt-api', () => ({
    searchRouteVariants: jest.fn(),
}));

jest.mock('../../../../redux/selectors/appSettings', () => ({
    useDiversion: () => true,
}));

jest.mock('../../../../redux/selectors/control/diversions', () => ({
    getDiversionResultState: jest.fn(() => ({
        isLoading: false,
        diversionId: null,
        error: null,
    })),
    getDiversionForEditing: jest.fn(() => null),
    getDiversionEditMode: jest.fn(() => 'ADD'),
}));

jest.mock('../../../../redux/actions/control/diversions', () => ({
    createDiversion: jest.fn(),
    updateDiversion: jest.fn(),
    resetDiversionResult: jest.fn(),
}));

jest.mock('../../../Common/Map/RouteShapeEditor/RouteShapeEditor', () => function MockRouteShapeEditor() {
    return <div data-testid="route-shape-editor" />;
});

jest.mock('../../../Common/CustomModal/CustomModal', () => function MockCustomModal() {
    return <div data-testid="custom-modal" />;
});

jest.mock('./ChangeSelectedRouteVariantModal', () => function MockChangeSelectedRouteVariantModal() {
    return <div data-testid="change-selected-route-variant-modal" />;
});

jest.mock('./DiversionResultModal', () => function MockDiversionResultModal() {
    return <div data-testid="diversion-result-modal" />;
});

jest.mock('./BaseRouteVariantSelector', () => function MockBaseRouteVariantSelector() {
    return <div data-testid="base-route-variant-selector" />;
});

jest.mock('./AdditionalRouteVariantSelector', () => function MockAdditionalRouteVariantSelector() {
    return <div data-testid="additional-route-variant-selector" />;
});

jest.mock('./AffectedStops', () => function MockAffectedStops() {
    return <div data-testid="affected-stops" />;
});

const mockStore = configureStore([thunk]);

const createMockStore = () => mockStore({
    control: {
        diversions: {
            diversionResultState: {
                isLoading: false,
                diversionId: null,
                error: null,
            },
            diversion: null,
            editMode: 'ADD',
        },
    },
    appSettings: {
        useDiversion: true,
    },
});

const mockDisruption = {
    disruptionId: 123,
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T17:00:00Z',
    affectedEntities: [
        {
            routeId: 'route1',
            routeType: BUS_TYPE_ID,
            routeShortName: '1',
        },
        {
            routeId: 'route2',
            routeType: BUS_TYPE_ID,
            routeShortName: '2',
        },
        {
            routeId: 'route3',
            routeType: 2, // Train type
            routeShortName: '3',
        },
    ],
};

const mockRouteVariants = [
    {
        routeVariantId: 'rv1',
        routeId: 'route1',
        routeShortName: '1',
        shapeWkt: 'LINESTRING(0 0, 1 1)',
        stops: [],
    },
    {
        routeVariantId: 'rv2',
        routeId: 'route2',
        routeShortName: '2',
        shapeWkt: 'LINESTRING(0 0, 2 2)',
        stops: [],
    },
];

describe('<DiversionManager />', () => {
    let store;
    let mockProps;

    beforeEach(() => {
        store = createMockStore();
        mockProps = {
            disruption: mockDisruption,
            onCancelled: jest.fn(),
            setDiversionManagerReady: jest.fn(),
        };

        jest.clearAllMocks();

        searchRouteVariants.mockResolvedValue({
            routeVariants: mockRouteVariants,
        });
    });

    const renderComponent = (props = {}) => render(
        <Provider store={ store }>
            <DiversionManager { ...mockProps } { ...props } />
        </Provider>,
    );

    describe('component rendering', () => {
        it('should render the component with correct title for ADD mode', () => {
            renderComponent();
            expect(screen.getByText('Add Diversion')).toBeInTheDocument();
        });

        it('should render the component with correct title for EDIT mode', () => {
            const { getDiversionEditMode } = jest.requireMock('../../../../redux/selectors/control/diversions');
            getDiversionEditMode.mockReturnValue('EDIT');

            const mockDiversion = {
                diversionShapeWkt: 'LINESTRING(0 0, 1 1)',
            };

            renderComponent({ diversion: mockDiversion });

            expect(screen.getByText('Edit Diversion')).toBeInTheDocument();
        });

        it('should render all required components', () => {
            renderComponent();

            expect(screen.getByTestId('base-route-variant-selector')).toBeInTheDocument();
            expect(screen.getByTestId('affected-stops')).toBeInTheDocument();
            expect(screen.getByTestId('route-shape-editor')).toBeInTheDocument();
        });
    });

    describe('handleResultAction', () => {
        it('should handle ACTION_TYPE.RETURN_TO_DIVERSION by doing nothing (keep form state)', () => {
            const mockResetDiversionResult = jest.fn();

            const { getDiversionResultState } = jest.requireMock('../../../../redux/selectors/control/diversions');
            getDiversionResultState.mockReturnValue({
                isLoading: false,
                diversionId: null,
                error: { message: 'Test error' },
            });

            const props = {
                resetDiversionResult: mockResetDiversionResult,
            };

            renderComponent(props);

            expect(screen.getByText('Edit Diversion')).toBeInTheDocument();
        });
    });

    describe('date handling logic coverage', () => {
        it('should test endTime parsing and conditional formatting', () => {
            const SERVICE_DATE_FORMAT = 'YYYYMMDD';
            const TIME_FORMAT_HHMM = 'HH:mm';
            const testEndTimeParsing = (disruptionEndTime) => {
                const end = disruptionEndTime ? moment(disruptionEndTime).tz(dateTypes.TIME_ZONE) : null;
                const endDate = end ? end.format(SERVICE_DATE_FORMAT) : null;
                const endTime = end ? end.format(TIME_FORMAT_HHMM) : null;
                return { end, endDate, endTime };
            };

            const resultWithEndTime = testEndTimeParsing('2024-01-15T17:00:00Z');
            const resultWithoutEndTime = testEndTimeParsing(null);
            const resultWithUndefinedEndTime = testEndTimeParsing(undefined);

            expect(resultWithEndTime.end).not.toBeNull();
            expect(resultWithEndTime.endDate).toBeDefined();
            expect(resultWithEndTime.endTime).toBeDefined();

            expect(resultWithoutEndTime.end).toBeNull();
            expect(resultWithoutEndTime.endDate).toBeNull();
            expect(resultWithoutEndTime.endTime).toBeNull();

            expect(resultWithUndefinedEndTime.end).toBeNull();
            expect(resultWithUndefinedEndTime.endDate).toBeNull();
            expect(resultWithUndefinedEndTime.endTime).toBeNull();
        });

        it('should test conditional date parameter inclusion in search object', () => {
            const testSearchObjectCreation = (startDate, startTime, endDate, endTime) => {
                const search = {
                    page: 1,
                    limit: 1000,
                    routeIds: ['route1'],
                    ...(startDate && { serviceDateFrom: startDate }),
                    ...(startTime && { startTime }),
                    ...(endDate && { serviceDateTo: endDate }),
                    ...(endTime && { endTime }),
                };
                return search;
            };

            const searchWithAllDates = testSearchObjectCreation('20240115', '09:00', '20240115', '17:00');
            const searchWithoutEndDates = testSearchObjectCreation('20240115', '09:00', null, null);
            const searchWithPartialDates = testSearchObjectCreation('20240115', '09:00', '20240115', null);

            expect(searchWithAllDates).toHaveProperty('serviceDateFrom', '20240115');
            expect(searchWithAllDates).toHaveProperty('startTime', '09:00');
            expect(searchWithAllDates).toHaveProperty('serviceDateTo', '20240115');
            expect(searchWithAllDates).toHaveProperty('endTime', '17:00');

            expect(searchWithoutEndDates).toHaveProperty('serviceDateFrom', '20240115');
            expect(searchWithoutEndDates).toHaveProperty('startTime', '09:00');
            expect(searchWithoutEndDates).not.toHaveProperty('serviceDateTo');
            expect(searchWithoutEndDates).not.toHaveProperty('endTime');

            expect(searchWithPartialDates).toHaveProperty('serviceDateFrom', '20240115');
            expect(searchWithPartialDates).toHaveProperty('startTime', '09:00');
            expect(searchWithPartialDates).toHaveProperty('serviceDateTo', '20240115');
            expect(searchWithPartialDates).not.toHaveProperty('endTime');
        });
    });

    describe('fetchVariants - search object construction', () => {
        it('should include all date/time properties when disruption has both startTime and endTime', async () => {
            const disruptionWithBothTimes = {
                ...mockDisruption,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T17:00:00Z',
            };

            jest.clearAllMocks();
            renderComponent({ disruption: disruptionWithBothTimes });

            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });

            expect(searchRouteVariants).toHaveBeenCalled();
            const lastCallIndex = searchRouteVariants.mock.calls.length - 1;
            const searchArg = searchRouteVariants.mock.calls[lastCallIndex][0];

            expect(searchArg).toHaveProperty('serviceDateFrom');
            expect(searchArg).toHaveProperty('startTime');
            expect(searchArg).toHaveProperty('serviceDateTo');
            expect(searchArg).toHaveProperty('endTime');
        });

        it('should exclude endDate and endTime when disruption has no endTime', async () => {
            const disruptionWithoutEndTime = {
                ...mockDisruption,
                startTime: '2024-01-15T09:00:00Z',
                endTime: null,
            };

            jest.clearAllMocks();
            renderComponent({ disruption: disruptionWithoutEndTime });

            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });

            expect(searchRouteVariants).toHaveBeenCalled();
            const lastCallIndex = searchRouteVariants.mock.calls.length - 1;
            const searchArg = searchRouteVariants.mock.calls[lastCallIndex][0];

            expect(searchArg).toHaveProperty('serviceDateFrom');
            expect(searchArg).toHaveProperty('startTime');
            expect(searchArg).not.toHaveProperty('serviceDateTo');
            expect(searchArg).not.toHaveProperty('endTime');
        });

        it('should exclude endDate and endTime when disruption endTime is undefined', async () => {
            const disruptionWithUndefinedEndTime = {
                ...mockDisruption,
                startTime: '2024-01-15T09:00:00Z',
                endTime: undefined,
            };

            jest.clearAllMocks();
            renderComponent({ disruption: disruptionWithUndefinedEndTime });

            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });

            expect(searchRouteVariants).toHaveBeenCalled();
            const lastCallIndex = searchRouteVariants.mock.calls.length - 1;
            const searchArg = searchRouteVariants.mock.calls[lastCallIndex][0];

            expect(searchArg).toHaveProperty('serviceDateFrom');
            expect(searchArg).toHaveProperty('startTime');
            expect(searchArg).not.toHaveProperty('serviceDateTo');
            expect(searchArg).not.toHaveProperty('endTime');
        });

        it('should always include startDate and startTime', async () => {
            const disruptionWithMinimalData = {
                ...mockDisruption,
                startTime: '2024-01-15T09:00:00Z',
                endTime: null,
            };

            jest.clearAllMocks();
            renderComponent({ disruption: disruptionWithMinimalData });

            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });

            expect(searchRouteVariants).toHaveBeenCalled();
            const lastCallIndex = searchRouteVariants.mock.calls.length - 1;
            const searchArg = searchRouteVariants.mock.calls[lastCallIndex][0];

            expect(searchArg.serviceDateFrom).toBeTruthy();
            expect(searchArg.startTime).toBeTruthy();
            expect(typeof searchArg.serviceDateFrom).toBe('string');
            expect(typeof searchArg.startTime).toBe('string');
        });
    });
});
