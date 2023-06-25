/** @jest-environment jsdom */
import React from 'react';
import moment from 'moment';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import { DATE_FORMAT_GTFS } from '../../../../utils/dateUtils';
import UpdateStopStatusModal from './UpdateStopStatusModal';
import { updateStopsModalTypes } from '../Types';

const mockStore = configureMockStore([thunk]);

let sandbox;
let wrapper;
const trip1 = {
    tripId: 'tripId',
    routeVariantId: 'test1',
    routeShortName: 'test1',
    routeLongName: 'test1',
    routeType: 3,
    agencyId: 'NZB',
    referenceId: 'test1',
    serviceId: 'test11',
    status: TRIP_STATUS_TYPES.notStarted,
    serviceDate: moment().format(DATE_FORMAT_GTFS),
};

const componentPropsMock = {
    onClose: jest.fn(),
    isModalOpen: true,
    activeModal: updateStopsModalTypes.UPDATE_HEADSIGN,
    tripInstance: trip1,
    moveTripToStop: jest.fn(),
    selectedStopsByTripKey: jest.fn(),
    areSelectedStopsUpdating: true,
    updateSelectedStopsStatus: jest.fn(),
    updateDestination: jest.fn(),
};

jest.mock(
    '../../../../redux/actions/control/routes/trip-instances',
    () => ({ updateSelectedStopsStatus: jest.mock(), updateDestination: jest.mock(), moveTripToStop: jest.mock() }),
);

const cache = createCache({ key: 'blah' });

const defaultStates = {
    control: {
        routes: {
            tripInstances: {
                areSelectedStopsUpdating: true,
                routeType: 3,
                tripInstance: {
                    tripId: '2',
                    serviceDate: '20190608',
                    startTime: '10:00:00',
                    routeShortName: '20',
                    routeType: 3,
                    status: 'NOT_STARTED',
                },
                selectedStops: [{
                    stopId: 'test7',
                    tripId: 'tripId',
                    stopSequence: 1,
                    stopCode: '1111',
                    stopName: 'test8',
                    arrivalTime: '00:00:00',
                    departureTime: '11:11:11',
                    scheduledArrivalTime: '00:00:00',
                    scheduledDepartureTime: '11:11:11',
                    status: 'NOT_PASSED',
                    parent: 'test9',
                }],
            },
        },
    },
    appSettings: {
        useRecurringCancellations: 'true',
    },
};

const setup = (customProps, customStates) => {
    const props = { ...componentPropsMock, ...customProps };
    const store = mockStore(customStates || defaultStates);
    return mount(<CacheProvider value={ cache }><Provider store={ store }><UpdateStopStatusModal { ...props } /></Provider></CacheProvider>);
};

const findElementByText = (htmlWrapper, elementType, elementText) => htmlWrapper.findWhere(node => node.type() === elementType && node.text() === elementText);

describe('<UpdateStopStatusModal />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        jest.clearAllMocks();
    });

    describe('render', () => {
        it('Should display UpdateStopStatusModal', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.UPDATE_HEADSIGN });
            expect(wrapper.find(UpdateStopStatusModal).length).toEqual(1);
            expect(findElementByText(wrapper, 'button', 'Update destination').length).toEqual(1);
        });

        it('Should Update destination button be disable when input empty', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.UPDATE_HEADSIGN });

            expect(wrapper.find(UpdateStopStatusModal).length).toEqual(1);
            expect(findElementByText(wrapper, 'button', 'Update destination').length).toEqual(1);
            expect(findElementByText(wrapper, 'button', 'Update destination').prop('disabled')).toEqual(true);
        });

        it('Should not found Update destination button when activeModal incorrect', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.SKIP });

            expect(wrapper.find(UpdateStopStatusModal).length).toEqual(1);
            expect(findElementByText(wrapper, 'button', 'Update destination').length).toEqual(0);
        });
    });
});
