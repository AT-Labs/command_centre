/** @jest-environment jsdom */

import { shallow } from 'enzyme';
import React from 'react';
import { withHooks } from 'jest-react-hooks-shallow';
import sinon from 'sinon';
import { App } from './App';
import Header from './Header/Header';
import ActivityIndicator from './ActivityIndicator';
import BrowserCompatibilityModal from '../Common/BrowserCompatibilityModal/BrowserCompatibilityModal';
import RealTimeView from '../RealTime/RealTimeView';
import VIEW_TYPE from '../../types/view-types';

jest.mock('../Control/DisruptionsView/DiversionManager', () => jest.fn());

let sandbox;
let wrapper;

const componentPropsMock = {
    hasError: false,
    isInitLoading: false,
    activeMainView: VIEW_TYPE.MAIN.REAL_TIME,
    setCache: jest.fn(),
    startPollingSiteStatus: jest.fn(),
    getTrains: jest.fn(),
    getBuses: jest.fn(),
    getFerries: jest.fn(),
    updateUserProfile: jest.fn(),
    fetchRoutesViewPermission: jest.fn(),
    fetchBlocksViewPermission: jest.fn(),
    fetchStopMessagingViewPermission: jest.fn(),
    fetchDisruptionsViewPermission: jest.fn(),
    fetchAlertsViewPermission: jest.fn(),
    fetchFleetsViewPermission: jest.fn(),
    startPollingAlerts: jest.fn(),
    getFleets: jest.fn(),
    startTrackingVehicleAllocations: jest.fn(),
    fetchTripReplaysViewPermission: jest.fn(),
    fetchNotificationsViewPermission: jest.fn(),
    getApplicationSettings: jest.fn(),
    getStops: jest.fn(),
    retrieveAgencies: jest.fn(),
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    wrapper = shallow(<App { ...props } />);
    return wrapper;
};

const mockResolveStaticData = () => {
    componentPropsMock.getTrains.mockResolvedValueOnce([]);
    componentPropsMock.getBuses.mockResolvedValueOnce([]);
    componentPropsMock.getFerries.mockResolvedValueOnce([]);
    componentPropsMock.setCache.mockResolvedValueOnce([]);
    componentPropsMock.getStops.mockResolvedValueOnce([]);
};

describe('<App />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        jest.resetAllMocks();
    });

    it('should render default view', () => {
        withHooks(() => {
            wrapper = setup();
            expect(wrapper.find(Header).exists()).toBeTruthy();
            expect(wrapper.find(ActivityIndicator).exists()).toBeTruthy();
            expect(wrapper.find(BrowserCompatibilityModal).exists()).toBeTruthy();
            expect(wrapper.find(RealTimeView).exists()).toBeTruthy();
        });
    });

    it('should fetch essential data when page rendered', () => {
        withHooks(() => {
            mockResolveStaticData();
            wrapper = setup();
            expect(componentPropsMock.getApplicationSettings).toHaveBeenCalled();
            expect(componentPropsMock.getTrains).toHaveBeenCalled();
            expect(componentPropsMock.getBuses).toHaveBeenCalled();
            expect(componentPropsMock.getFerries).toHaveBeenCalled();
            expect(componentPropsMock.setCache).toHaveBeenCalled();
            expect(componentPropsMock.getStops).toHaveBeenCalled();
        });
    });
});
