import React from 'react';
import { shallow } from 'enzyme';
import { RRule } from 'rrule';
import { CreateDisruption } from './index';
import LoadingOverlay from '../../../../Common/Overlay/LoadingOverlay';
import { searchByDrawing, updateCurrentStep } from '../../../../../redux/actions/control/disruptions';
import DrawLayer from './DrawLayer';
import { buildSubmitBody, generateDisruptionActivePeriods } from '../../../../../utils/control/disruptions';
import { STATUSES } from '../../../../../types/disruptions-types';

jest.mock('../../../../Common/Map/ShapeLayer/ShapeLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/StopsLayer', () => jest.fn());

jest.mock('../../../../Common/Map/HighlightingLayer/HighlightingLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/SelectedStopsMarker', () => jest.fn());

jest.mock('./DrawLayer', () => () => <div data-testid="draw-layer" />);

jest.mock('../../../../Common/CustomModal/CustomModal', () => jest.fn());

const disruptionActivePeriodsMock = [
    {
        endTime: 1732571652,
        startTime: 1732312452,
    },
];

const disruptionShapeMock = {
    type: 'circle',
    coordinates: [
        {
            lat: -36.72166946698102,
            lng: 174.7056841850281,
        },
    ],
    radius: 63.91801531070022,
};

const disruptionDataMock = {
    activePeriods: disruptionActivePeriodsMock,
    disruptionType: 'type',
    endTime: '11:10:00',
};

jest.mock('../../../../../utils/control/disruptions', () => ({
    generateDisruptionActivePeriods: jest.fn().mockReturnValue(disruptionActivePeriodsMock),
    buildSubmitBody: jest.fn(),
    momentFromDateTime: jest.fn(),
}));

const mockAction = { resultDisruptionId: 12345 };

describe('CreateDisruption component', () => {
    it('should render a SidePanel component with a LoadingOverlay if isLoading is true', () => {
        const wrapper = shallow(<CreateDisruption isLoading action={ mockAction } updateCurrentStep={ updateCurrentStep } />);
        expect(wrapper.find(LoadingOverlay)).toHaveLength(1);
    });

    it('should render a SidePanel component without a LoadingOverlay if isLoading is false', () => {
        const wrapper = shallow(<CreateDisruption action={ mockAction } updateCurrentStep={ updateCurrentStep } />);
        expect(wrapper.find(LoadingOverlay)).toHaveLength(0);
    });

    it('calls searchByDrawing with shape when disruptionData.activePeriods is provided', () => {
        const spy = jest.spyOn({ searchByDrawing }, 'searchByDrawing').mockImplementation();

        const wrapper = shallow(<CreateDisruption action={ mockAction } updateCurrentStep={ updateCurrentStep } />);
        wrapper.setState({
            disruptionData: disruptionDataMock,
        });
        wrapper.setProps({
            searchByDrawing: spy,
            useGeoSearchRoutesByDisruptionPeriod: true,
        });

        const drawLayer = wrapper.find(DrawLayer);
        drawLayer.prop('onDrawCreated')(disruptionShapeMock);

        expect(generateDisruptionActivePeriods).toHaveBeenCalledTimes(0);
        expect(spy).toHaveBeenCalledWith(
            disruptionDataMock.disruptionType,
            expect.objectContaining({
                ...disruptionShapeMock,
                activePeriods: disruptionActivePeriodsMock,
            }),
        );
    });

    it('should call searchByDrawing with shape and calculated activePeriods when activePeriods is empty and endTime is provided', () => {
        const spy = jest.spyOn({ searchByDrawing }, 'searchByDrawing').mockImplementation();

        const wrapper = shallow(<CreateDisruption action={ mockAction } updateCurrentStep={ updateCurrentStep } />);
        wrapper.setState({
            disruptionData: {
                ...disruptionDataMock,
                activePeriods: [],
            },
        });
        wrapper.setProps({
            searchByDrawing: spy,
            useGeoSearchRoutesByDisruptionPeriod: true,
        });

        const drawLayer = wrapper.find(DrawLayer);
        drawLayer.prop('onDrawCreated')(disruptionShapeMock);

        expect(spy).toHaveBeenCalledWith(
            disruptionDataMock.disruptionType,
            expect.objectContaining({
                ...disruptionShapeMock,
                activePeriods: disruptionActivePeriodsMock,
            }),
        );
    });

    it('passes shape without modification if useGeoSearchRoutesByDisruptionPeriod is false', () => {
        const spy = jest.spyOn({ searchByDrawing }, 'searchByDrawing').mockImplementation();

        const wrapper = shallow(<CreateDisruption action={ mockAction } updateCurrentStep={ updateCurrentStep } />);
        wrapper.setState({
            disruptionData: disruptionDataMock,
        });
        wrapper.setProps({
            searchByDrawing: spy,
            useGeoSearchRoutesByDisruptionPeriod: false,
        });

        const drawLayer = wrapper.find(DrawLayer);
        drawLayer.prop('onDrawCreated')(disruptionShapeMock);

        expect(spy).toHaveBeenCalledWith(disruptionDataMock.disruptionType, disruptionShapeMock);
    });

    describe('onSubmitDraft', () => {
        let wrapper;
        const mockUpdateCurrentStep = jest.fn();
        const mockCreateDisruption = jest.fn();
        const mockOpenCreateDisruption = jest.fn();
        const mockToggleDisruptionModals = jest.fn();

        const dtstart = new Date('2025-03-01T10:00:00.000Z');
        const until = new Date('2022-03-09T06:00:00.000Z');
        const mockDisruptionData = {
            startDate: dtstart,
            startTime: '10:00:00',
            endDate: until,
            endTime: '11:00:00',
            disruptionType: 'type',
            activePeriods: [],
            recurrencePattern: {
                freq: 2,
                dtstart,
                until,
                byweekday: [0],
            },
        };

        beforeEach(() => {
            wrapper = shallow(
                <CreateDisruption
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createDisruption={ mockCreateDisruption }
                    openCreateDisruption={ mockOpenCreateDisruption }
                    toggleDisruptionModals={ mockToggleDisruptionModals }
                    disruptionData={ mockDisruptionData }
                    action={ mockAction }
                />,
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should call updateCurrentStep with 1', async () => {
            await wrapper.instance().onSubmitDraft();
            expect(mockUpdateCurrentStep).toHaveBeenCalledWith(1);
        });

        it('should call openCreateDisruption with false', async () => {
            await wrapper.instance().onSubmitDraft();
            expect(mockOpenCreateDisruption).toHaveBeenCalledWith(false);
        });

        it('should call toggleDisruptionModals with isConfirmationOpen and true', async () => {
            await wrapper.instance().onSubmitDraft();
            expect(mockToggleDisruptionModals).toHaveBeenCalledWith('isConfirmationOpen', true);
        });

        it('should call createDisruption', async () => {
            await wrapper.instance().onSubmitDraft();
            expect(mockCreateDisruption).toHaveBeenCalledTimes(1);
        });

        it('should call createDisruption with recurrencePattern without start end dates', async () => {
            const disruptionData = {
                recurrent: true,
                startTime: undefined,
                endTime: undefined,
                recurrencePattern: {
                    freq: 2,
                    byweekday: undefined,
                    dtstart,
                    until,
                },
            };
            const expectedDisruption = {
                ...disruptionData,
                recurrencePattern: { freq: RRule.WEEKLY, byweekday: [] },
                endTime: undefined,
                startTime: undefined,
                status: STATUSES.DRAFT,
                notes: [],
            };

            buildSubmitBody.mockReturnValue(expectedDisruption);
            wrapper.setState({ disruptionData });

            await wrapper.instance().onSubmitDraft();

            expect(mockCreateDisruption).toHaveBeenCalledWith(expectedDisruption);
        });

        it('should call createDisruption with full recurrencePattern', async () => {
            const disruptionData = {
                ...disruptionDataMock,
                startTime: dtstart,
                endTime: until,
                status: STATUSES.DRAFT,
                notes: [],
            };
            const expectedDisruption = {
                ...disruptionDataMock,
                recurrencePattern: {
                    freq: RRule.WEEKLY,
                    byweekday: [RRule.MO, RRule.FR],
                    dtstart,
                    until,
                },
                endTime: until,
                startTime: dtstart,
                status: STATUSES.DRAFT,
                notes: [],
            };

            buildSubmitBody.mockReturnValue(expectedDisruption);
            wrapper.setState({ disruptionData });

            await wrapper.instance().onSubmitDraft();

            expect(mockCreateDisruption).toHaveBeenCalledWith(expectedDisruption);
        });
    });
});
