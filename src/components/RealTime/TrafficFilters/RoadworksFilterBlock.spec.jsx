import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RoadworksFilterBlock, RoadworksFilterCategories, readUrlToCarsRoadworksLayer, updateUrlFromCarsRoadworksLayer } from './RoadworksFilterBlock';
import CustomizedSwitch from '../../Common/Switch/CustomizedSwitch';
import { INIT_STATE } from '../../../redux/reducers/realtime/layers';
import ACTION_TYPE from '../../../redux/action-types';
import { isRoadworksQueryValid } from '../../../utils/realtimeMap';

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
describe('<RoadworksFilterBlock />', () => {
    let store;
    let dispatchMock;

    // Utilities for this test
    const renderRoadworksFilterBlockWithStore = mockedStore => mount(
        <Provider store={ mockedStore }>
            <ThemeProvider theme={ theme }>
                <RoadworksFilterBlock />
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
        const wrapper = renderRoadworksFilterBlockWithStore(store);
        expect(wrapper.exists()).toBe(true);
    });

    it('should render the switch with correct props', () => {
        const wrapper = renderRoadworksFilterBlockWithStore(store);
        const switchComponent = wrapper.find(CustomizedSwitch);
        expect(switchComponent.prop('checked')).toBe(false);
    });

    it('should dispatch updateShowRoadworks action when switch is toggled', () => {
        const wrapper = renderRoadworksFilterBlockWithStore(store);
        const switchComponent = wrapper.find(CustomizedSwitch);
        switchComponent.simulate('change', false);
        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({
            type: ACTION_TYPE.UPDATE_SHOW_ROADWORKS,
            payload: {
                showRoadworks: false, // It takes the current value before toggle. In redux, it toggles this value
                selectedRoadworksFilters: [], // Empty because we did not mock this as we are not testing this here!
            },
        });
    });

    it('should render the correct number of filter categories', () => {
        store = createMockedStore({
            showRoadworks: true,
            selectedRoadworksFilters: [...RoadworksFilterCategories],
        });
        const wrapper = renderRoadworksFilterBlockWithStore(store);
        expect(wrapper.find('Input').length).toBe(RoadworksFilterCategories.length);
    });

    it('should dispatch updateSelectedRoadworksFilters action when a filter is toggled', () => {
        store = createMockedStore({
            showRoadworks: true,
            selectedRoadworksFilters: [...RoadworksFilterCategories],
        });
        const wrapper = renderRoadworksFilterBlockWithStore(store);

        const firstCategoryCheckbox = wrapper.find('Input').at(0);
        firstCategoryCheckbox.simulate('change');
        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({
            type: ACTION_TYPE.UPDATE_SELECTED_ROADWORKS_FILTERS,
            payload: {
                selectedRoadworksFilters: [...RoadworksFilterCategories.map((category, index) => ({
                    ...category,
                    selected: index === 0 ? !category.selected : category.selected,
                }))],
            },
        });
    });
});

describe('readUrlToCarsRoadworksLayer', () => {
    const roadworkFilterCategoriesWithEventsUnselected = [...RoadworksFilterCategories];
    roadworkFilterCategoriesWithEventsUnselected[2].selected = false;

    const testCases = [
        {
            description: 'should update showRoadworks and selectedRoadworksFilters when roadworks query is valid',
            searchParams: new URLSearchParams('roadworks=Excavation,Non-Excavation'),
            expectedIsRoadworksQueryValid: true,
            expectedDispatch: {
                showRoadworks: true,
                selectedRoadworksFilters: roadworkFilterCategoriesWithEventsUnselected,
            },
            shouldDispatch: true,
        },
        {
            description: 'should not update showRoadworks and selectedRoadworksFilters when roadworks query is invalid',
            searchParams: new URLSearchParams('roadworks=InvalidQuery'),
            expectedIsRoadworksQueryValid: false,
            expectedDispatch: null,
            shouldDispatch: false,
        },
        {
            description: 'should not update showRoadworks and selectedRoadworksFilters when roadworks query is missing',
            searchParams: new URLSearchParams(),
            expectedIsRoadworksQueryValid: false,
            expectedDispatch: null,
            shouldDispatch: false,
        },
    ];

    testCases.forEach(({ description, searchParams, expectedIsRoadworksQueryValid, expectedDispatch, shouldDispatch }) => {
        it(description, () => {
            const updateShowRoadworksDispatcher = jest.fn();

            const query = searchParams.get('roadworks');
            expect(isRoadworksQueryValid(query)).toBe(expectedIsRoadworksQueryValid);

            readUrlToCarsRoadworksLayer(searchParams, isRoadworksQueryValid, updateShowRoadworksDispatcher);
            if (shouldDispatch) {
                expect(updateShowRoadworksDispatcher).toHaveBeenCalledWith(expectedDispatch);
            } else {
                expect(updateShowRoadworksDispatcher).not.toHaveBeenCalled();
            }
        });
    });
});

describe('updateUrlFromCarsRoadworksLayer', () => {
    const testCases = [
        {
            description: 'should update the URL with selected roadworks filters',
            selectedRoadworksFilters: [
                { id: 'Excavation', selected: true },
                { id: 'Non-Excavation', selected: true },
                { id: 'Event', selected: false },
            ],
            expectedUrl: 'roadworks=Excavation,Non-Excavation',
        },
        {
            description: 'should update the URL with all selected roadworks filters',
            selectedRoadworksFilters: [
                { id: 'Excavation', selected: true },
                { id: 'Non-Excavation', selected: true },
                { id: 'Event', selected: true },
            ],
            expectedUrl: 'roadworks=Excavation,Non-Excavation,Event',
        },
        {
            description: 'should not update the URL if no roadworks filters are selected',
            selectedRoadworksFilters: [
                { id: 'Excavation', selected: false },
                { id: 'Non-Excavation', selected: false },
                { id: 'Event', selected: false },
            ],
            expectedUrl: '',
        },
    ];

    testCases.forEach(({ description, selectedRoadworksFilters, expectedUrl }) => {
        it(description, () => {
            const searchParams = new URLSearchParams();

            updateUrlFromCarsRoadworksLayer(selectedRoadworksFilters, searchParams);
            expect(decodeURIComponent(searchParams.toString())).toBe(expectedUrl);
        });
    });
});
