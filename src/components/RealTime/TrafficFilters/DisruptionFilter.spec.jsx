import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CustomizedSwitch from '../../Common/Switch/CustomizedSwitch';
import { INIT_STATE } from '../../../redux/reducers/realtime/layers';
import ACTION_TYPE from '../../../redux/action-types';
import { isDisruptionsQueryValid } from '../../../utils/realtimeMap';
import {
    DisruptionFilter,
    DisruptionFilterCategories, mapFiltersToStatuses,
    readUrlToDisruptionLayer,
    updateUrlFromDisruptionsLayer,
} from './DisruptionFilter';

const theme = createTheme();

jest.mock('../../Common/Switch/CustomizedSwitch', () => props => (
    <input
        type="checkbox"
        data-testid="mock-customized-switch"
        // eslint-disable-next-line react/prop-types
        checked={ props.checked }
        // eslint-disable-next-line react/prop-types
        onChange={ e => props.onChange(e.target.checked) }
    />
));

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

const mockStore = configureStore([]);
describe('<DisruptionFilter />', () => {
    let store;
    let dispatchMock;

    // Utilities for this test
    const renderDisruptionFilterWithStore = mockedStore => mount(
        <Provider store={ mockedStore }>
            <ThemeProvider theme={ theme }>
                <DisruptionFilter />
            </ThemeProvider>
        </Provider>,
    );

    const createMockedStore = (overrides = {}) => {
        const initialState = {
            realtime: {
                layers: {
                    ...INIT_STATE,
                    ...overrides,
                },
            },
        };
        return mockStore(initialState);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        store = createMockedStore();
        dispatchMock = jest.fn();
        useDispatch.mockReturnValue(dispatchMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Unit tests
    it('should render without crashing', () => {
        const wrapper = renderDisruptionFilterWithStore(store);
        expect(wrapper.exists()).toBe(true);
    });

    it('should render the switch with correct props', () => {
        const wrapper = renderDisruptionFilterWithStore(store);
        const switchComponent = wrapper.find(CustomizedSwitch);
        expect(switchComponent.prop('checked')).toBe(false);
    });

    it('should dispatch updateShowDisruptions action when switch is toggled', () => {
        const wrapper = renderDisruptionFilterWithStore(store);
        const switchComponent = wrapper.find(CustomizedSwitch);
        switchComponent.simulate('change', false);
        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({
            type: ACTION_TYPE.UPDATE_SHOW_DISRUPTIONS,
            payload: {
                showDisruptions: false,
                selectedDisruptionFilters: [],
            },
        });
    });

    it('should render the correct number of filter categories', () => {
        store = createMockedStore({
            showDisruptions: true,
            selectedDisruptionFilters: DisruptionFilterCategories,
        });
        const wrapper = renderDisruptionFilterWithStore(store);
        expect(wrapper.find('Input').length).toBe(DisruptionFilterCategories.length);
    });

    it('should dispatch updateSelectedDisruptionFilters action when a filter is toggled', () => {
        store = createMockedStore({
            showDisruptions: true,
            selectedDisruptionFilters: DisruptionFilterCategories,
        });
        const wrapper = renderDisruptionFilterWithStore(store);

        const firstCategoryCheckbox = wrapper.find('Input').at(0);
        firstCategoryCheckbox.simulate('change');
        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({
            type: ACTION_TYPE.UPDATE_SELECTED_DISRUPTION_FILTERS,
            payload: {
                selectedDisruptionFilters: [DisruptionFilterCategories[1]],
            },
        });
    });
});

describe('readUrlToDisruptionLayer', () => {
    const disruptionFilterCategoriesWithEventsUnselected = [DisruptionFilterCategories[1]];
    const testCases = [
        {
            description: 'should update showDisruptions and selectedDisruptionFilters when disruptions query is valid',
            searchParams: new URLSearchParams('disruptions=Planned'),
            expectedIsDisruptionQueryValid: true,
            expectedDispatch: {
                showDisruptions: true,
                selectedDisruptionFilters: disruptionFilterCategoriesWithEventsUnselected,
            },
            shouldDispatch: true,
        },
        {
            description: 'should not update showDisruptions and selectedDisruptionFilters when disruptions query is invalid',
            searchParams: new URLSearchParams('disruptions=InvalidQuery'),
            expectedIsDisruptionQueryValid: false,
            expectedDispatch: null,
            shouldDispatch: false,
        },
        {
            description: 'should not update showDisruptions and selectedDisruptionFilters when disruptions query is missing',
            searchParams: new URLSearchParams(),
            expectedIsDisruptionQueryValid: false,
            expectedDispatch: null,
            shouldDispatch: false,
        },
    ];

    testCases.forEach(({ description, searchParams, expectedIsDisruptionQueryValid, expectedDispatch, shouldDispatch }) => {
        it(description, () => {
            const updateShowDisruptionsDispatcher = jest.fn();

            const query = searchParams.get('disruptions');
            expect(isDisruptionsQueryValid(query)).toBe(expectedIsDisruptionQueryValid);

            readUrlToDisruptionLayer(searchParams, isDisruptionsQueryValid, updateShowDisruptionsDispatcher);
            if (shouldDispatch) {
                expect(updateShowDisruptionsDispatcher).toHaveBeenCalledWith(expectedDispatch);
            } else {
                expect(updateShowDisruptionsDispatcher).not.toHaveBeenCalled();
            }
        });
    });
});

describe('updateUrlFromDisruptionsLayer', () => {
    const testCases = [
        {
            description: 'should update the URL with selected disruptions filters',
            selectedDisruptionFilters: [DisruptionFilterCategories[0]],
            expectedUrl: 'disruptions=Active',
        },
        {
            description: 'should update the URL with all selected disruptions filters',
            selectedDisruptionFilters: DisruptionFilterCategories,
            expectedUrl: 'disruptions=Active,Planned',
        },
        {
            description: 'should not update the URL if no disruptions filters are selected',
            selectedDisruptionFilters: [],
            expectedUrl: '',
        },
    ];

    testCases.forEach(({ description, selectedDisruptionFilters, expectedUrl }) => {
        it(description, () => {
            const searchParams = new URLSearchParams();

            updateUrlFromDisruptionsLayer(selectedDisruptionFilters, searchParams);
            expect(decodeURIComponent(searchParams.toString())).toBe(expectedUrl);
        });
    });
});

describe('mapFiltersToStatuses', () => {
    const testCases = [
        {
            description: 'should return all statuses for all filters',
            selectedDisruptionFilters: DisruptionFilterCategories,
            expectedStatuses: ['in-progress', 'not-started'],
        },
        {
            description: 'should return empty array of statuses if filters are empty',
            selectedDisruptionFilters: [],
            expectedStatuses: [],
        },
        {
            description: 'should return array with only one status when filter is single',
            selectedDisruptionFilters: [DisruptionFilterCategories[0]],
            expectedStatuses: ['in-progress'],
        },
    ];

    testCases.forEach(({ description, selectedDisruptionFilters, expectedStatuses }) => {
        it(description, () => {
            const result = mapFiltersToStatuses(selectedDisruptionFilters);
            expect(result).toStrictEqual(expectedStatuses);
        });
    });
});
