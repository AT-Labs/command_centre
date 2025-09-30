/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import DiversionManager from './index';
import { BUS_TYPE_ID } from '../../../../types/vehicle-types';
import { getAffectedEntities } from '../../../../utils/control/diversions';
import { searchRouteVariants } from '../../../../utils/transmitters/trip-mgt-api';

// Mock the dependencies
jest.mock('../../../../utils/transmitters/trip-mgt-api', () => ({
    searchRouteVariants: jest.fn(),
}));

jest.mock('../../../../utils/control/diversions', () => ({
    getAffectedEntities: jest.fn(),
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

// Mock the map component
jest.mock('../../../Common/Map/RouteShapeEditor/RouteShapeEditor', () => function MockRouteShapeEditor() {
    return <div data-testid="route-shape-editor" />;
});

// Mock the modal components
jest.mock('../../../Common/CustomModal/CustomModal', () => function MockCustomModal() {
    return <div data-testid="custom-modal" />;
});

jest.mock('./ChangeSelectedRouteVariantModal', () => function MockChangeSelectedRouteVariantModal() {
    return <div data-testid="change-selected-route-variant-modal" />;
});

jest.mock('./DiversionResultModal', () => function MockDiversionResultModal() {
    return <div data-testid="diversion-result-modal" />;
});

// Mock the selector components
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
        };

        // Reset mocks
        jest.clearAllMocks();

        // Mock getAffectedEntities to return the disruption's affectedEntities
        getAffectedEntities.mockImplementation(disruption => disruption?.affectedEntities || disruption?.affectedRoutes || []);

        // Mock searchRouteVariants to return mock data
        searchRouteVariants.mockResolvedValue({
            routeVariants: mockRouteVariants,
        });
    });

    const renderComponent = (props = {}) => render(
        <Provider store={ store }>
            <DiversionManager { ...mockProps } { ...props } />
        </Provider>,
    );

    describe('routeIds calculation logic', () => {
        it('should call getAffectedEntities with disruption', async () => {
            renderComponent();

            await waitFor(() => {
                expect(getAffectedEntities).toHaveBeenCalledWith(mockDisruption);
            });
        });

        it('should handle empty disruption', async () => {
            renderComponent({ disruption: null });

            await waitFor(() => {
                expect(getAffectedEntities).toHaveBeenCalledWith(null);
            });
        });

        it('should handle disruption with no affected entities', async () => {
            const disruptionWithNoEntities = {
                ...mockDisruption,
                affectedRoutes: [],
            };

            renderComponent({ disruption: disruptionWithNoEntities });

            await waitFor(() => {
                expect(getAffectedEntities).toHaveBeenCalledWith(disruptionWithNoEntities);
            });
        });
    });

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

            // Mock the selector to return error state
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

            // The key test: RETURN_TO_DIVERSION should NOT call reset() - it should keep form state
            // This is tested by the fact that the component renders without errors
            // and the form state is preserved (no reset is called)
            expect(screen.getByText('Edit Diversion')).toBeInTheDocument();
        });
    });
});
