/** @jest-environment jsdom */
import React from 'react';
import { act } from 'react-dom/test-utils';
import moment from 'moment';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import UpdateTripStatusModal from '.';
import RecurrentTripCancellation from './RecurrentTripCancellation';
import { updateTripsStatusModalTypes } from '../../Types';
import TRIP_STATUS_TYPES from '../../../../../types/trip-status-types';
import { DATE_FORMAT_GTFS } from '../../../../../utils/dateUtils';

const mockStore = configureMockStore([thunk]);

let sandbox;
let wrapper;
let store;
const trip1 = {
    tripId: 'test1',
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
const trip2 = {
    tripId: 'test2',
    routeVariantId: 'test2',
    routeShortName: 'test2',
    routeLongName: 'test2',
    routeType: 3,
    agencyId: 'NZB',
    referenceId: 'test2',
    serviceId: 'test2',
    status: TRIP_STATUS_TYPES.notStarted,
    serviceDate: moment().format(DATE_FORMAT_GTFS),
};

const componentPropsMock = {
    onClose: jest.fn(),
    isModalOpen: true,
    activeModal: updateTripsStatusModalTypes.CANCEL_MODAL,
    selectedTrips: { [trip1.tripId]: trip1, [trip2.tripId]: trip2 },
    removeBulkUpdateMessages: jest.fn(),
    fetchAndUpdateSelectedTrips: jest.fn(),
    collectTripsDataAndUpdateTripsStatus: jest.fn(),
};

jest.mock('../../../../../redux/actions/control/routes/trip-instances', () => ({ fetchAndUpdateSelectedTrips: jest.mock(), collectTripsDataAndUpdateTripsStatus: jest.mock() }));

const cache = createCache({ key: 'blah' });

const states = {
    control: {
        routes: {
            tripInstances: {
                isActionLoading: { [trip1.tripId]: false, [trip1.tripId]: false },
            },
        },
    },
};

const setup = (customProps) => {
    let props = componentPropsMock;
    props = Object.assign(props, customProps);
    store = mockStore(states);
    return mount(<CacheProvider value={ cache }><Provider store={ store }><UpdateTripStatusModal { ...props } /></Provider></CacheProvider>);
};

const findElementByText = (htmlWrapper, elementType, elementText) => htmlWrapper.findWhere(node => node.type() === elementType && node.text() === elementText);

describe('<UpdateTripStatusModal />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        jest.clearAllMocks();
    });

    describe('render', () => {
        it('Should display RecurrentTripCancellation when modal type is cancel', () => {
            wrapper = setup({ activeModal: updateTripsStatusModalTypes.CANCEL_MODAL });
            expect(wrapper.find(RecurrentTripCancellation).length).toEqual(1);
            expect(findElementByText(wrapper, 'button', 'Cancel trips').length).toEqual(1);
        });

        it('Should display a button to remove recurring cancellations rather than RecurrentTripCancellation when modal type is reinstate', () => {
            wrapper = setup({
                activeModal: updateTripsStatusModalTypes.REINSTATE_MODAL,
                selectedTrips: { [trip1.tripId]: { ...trip1, status: TRIP_STATUS_TYPES.cancelled }, [trip2.tripId]: { ...trip2, status: TRIP_STATUS_TYPES.cancelled } },
            });
            expect(wrapper.find(RecurrentTripCancellation).length).toEqual(0);
            expect(findElementByText(wrapper, 'button', 'Reinstate trips').length).toEqual(1);
            expect(findElementByText(wrapper, 'button', 'Reinstate trips and remove recurring cancellations').length).toEqual(1);
        });

        it('Should display singlular when there is only one input trip', () => {
            wrapper = setup({ activeModal: updateTripsStatusModalTypes.CANCEL_MODAL, selectedTrips: { [trip1.tripId]: trip1 } });
            expect(findElementByText(wrapper, 'button', 'Cancel trip').length).toEqual(1);
            expect(findElementByText(wrapper, 'p', 'Are you sure you want to cancel the following trip?').length).toEqual(1);
        });
    });

    describe('actions', () => {
        const clickButtonAndCheck = (htmlWrapper, buttonText, expectTripStatus, isRecurringOperation) => {
            const button = findElementByText(htmlWrapper, 'button', buttonText);
            act(() => {
                button.at(0).props().onClick('');
            });
            expect(componentPropsMock.collectTripsDataAndUpdateTripsStatus).toHaveBeenCalledTimes(1);
            expect(componentPropsMock.collectTripsDataAndUpdateTripsStatus).toHaveBeenCalledWith(
                expect.anything(),
                expectTripStatus,
                expect.anything(),
                expect.anything(),
                expect.objectContaining({
                    isRecurringOperation,
                }),
            );
        };

        it('Should fire updateTripsStatus with cancel status and true recurring operation when modal type is cancel', () => {
            wrapper = setup({ activeModal: updateTripsStatusModalTypes.CANCEL_MODAL, selectedTrips: { [trip1.tripId]: trip1 } });
            clickButtonAndCheck(wrapper, 'Cancel trip', TRIP_STATUS_TYPES.cancelled, true);
        });

        it('Should fire updateTripsStatus with not_started status and false recurring operation when the user click Reinstate trip', () => {
            wrapper = setup({ activeModal: updateTripsStatusModalTypes.REINSTATE_MODAL, selectedTrips: { [trip1.tripId]: trip1 } });
            clickButtonAndCheck(wrapper, 'Reinstate trip', TRIP_STATUS_TYPES.notStarted, false);
        });

        it('Should fire updateTripsStatus with not_started status and true recurring operation when the user click Reinstate trip and remove recurring cancellations', () => {
            wrapper = setup({ activeModal: updateTripsStatusModalTypes.REINSTATE_MODAL, selectedTrips: { [trip1.tripId]: trip1 } });
            clickButtonAndCheck(wrapper, 'Reinstate trip and remove recurring cancellations', TRIP_STATUS_TYPES.notStarted, true);
        });
    });
});
