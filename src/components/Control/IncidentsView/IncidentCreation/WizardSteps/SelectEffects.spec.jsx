import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { withHooks } from 'jest-react-hooks-shallow';
import { SelectEffects } from './SelectEffects';
import Footer from './Footer';
import SelectEffectEntities from './SelectEffectEntities';

let sandbox;
let wrapper;

jest.useFakeTimers();

const impacts = [
    { label: '', value: '' },
    { label: '123', value: '123' },
    { label: 'Buses replace trains', value: 'BUSES_REPLACE_TRAINS' },
    { label: 'Bus replaces ferry', value: 'BUS_REPLACES_FERRY' },
    { label: 'Cancellations', value: 'CANCELLATIONS' },
];

const mockDisruption = {
    key: 'DISR123',
    impact: impacts[1].value,
    startTime: '06:00',
    startDate: '09/03/2022',
    endTime: '06:00',
    endDate: '10/03/2022',
    cause: 'CAPACITY_ISSUE',
    mode: '-',
    status: 'not-started',
    header: 'Incident Title',
    url: 'https://at.govt.nz',
    createNotification: false,
    recurrent: true,
    duration: '2',
    recurrencePattern: {
        freq: 2,
        dtstart: new Date('2022-03-09T06:00:00.000Z'),
        until: new Date('2022-03-10T06:00:00.000Z'),
        byweekday: [0],
    },
    severity: 'MINOR',
    affectedEntities: {
        affectedRoutes: [{
            category: { type: 'route', icon: '', label: 'Routes' },
            labelKey: 'routeShortName',
            routeId: 'WEST-201',
            routeShortName: '201',
            routeLongName: 'West Auckland to City',
            directionId: 0,
            routeType: 3,
        }],
        affectedStops: [{
            category: { type: 'stop', icon: '', label: 'Stops' },
            labelKey: 'stopCode',
            stopId: 'STOP-123',
            stopCode: '1234',
            stopName: 'Test Stop',
            stopLat: -36.8485,
            stopLon: 174.7633,
        }],
    },
    isStartDateDirty: false,
    isEndDateDirty: false,
    isRecurrencePatternDirty: false,
    disruptionType: 'ROUTE',
};

const mockIncident = {
    incidentNo: 'INC123',
    header: 'Test Incident',
    cause: 'CAPACITY_ISSUE',
    impact: 'CANCELLATIONS',
    startTime: '06:00',
    startDate: '09/03/2022',
    endTime: '18:00',
    endDate: '09/03/2022',
    status: 'not-started',
    severity: 'MINOR',
    recurrent: false,
    createNotification: false,
    disruptions: [mockDisruption],
};

const defaultProps = {
    data: mockIncident,
    onDataUpdate: jest.fn(),
    updateCurrentStep: jest.fn(),
    getStopsByRoute: jest.fn(),
    updateAffectedStopsState: jest.fn(),
    getRoutesByShortName: jest.fn(),
    updateAffectedRoutesState: jest.fn(),
    toggleIncidentModals: jest.fn(),
    search: jest.fn(),
    searchResults: [],
    findStopsByRoute: jest.fn(),
    isEditMode: false,
    isEditDisabled: false,
    useDraftDisruptions: false,
};

const setup = (customProps = {}) => {
    const props = { ...defaultProps, ...customProps };
    return shallow(<SelectEffects { ...props } />);
};

describe('<SelectEffects />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        jest.clearAllMocks();
    });

    describe('Basic rendering', () => {
        it('should render without crashing', () => {
            withHooks(() => {
                wrapper = setup();
                expect(wrapper).toHaveLength(1);
            });
        });

        it('should render Footer component', () => {
            withHooks(() => {
                wrapper = setup();
                expect(wrapper.find(Footer)).toHaveLength(1);
            });
        });

        it('should render SelectEffectEntities for each disruption', () => {
            withHooks(() => {
                wrapper = setup();
                expect(wrapper.find(SelectEffectEntities)).toHaveLength(1);
            });
        });
    });

    describe('Effect inputs rendering', () => {
        it('should render effect inputs for each disruption', () => {
            withHooks(() => {
                wrapper = setup();
                const effectStartDate = wrapper.find('#disruption-creation__wizard-select-details__start-date');
                const effectEndDate = wrapper.find('#disruption-creation__wizard-select-details__end-date');

                expect(effectStartDate).toHaveLength(1);
                expect(effectEndDate).toHaveLength(1);
            });
        });

        it('should render multiple effects with different time ranges', () => {
            withHooks(() => {
                const data = {
                    ...mockIncident,
                    startTime: '10:00',
                    startDate: '09/03/2022',
                    endTime: '18:00',
                    endDate: '09/03/2022',
                    disruptions: [
                        {
                            ...mockDisruption,
                            key: 'DISR123',
                            startTime: '08:00',
                            startDate: '09/03/2022',
                            endTime: '12:00',
                            endDate: '09/03/2022',
                        },
                        {
                            ...mockDisruption,
                            key: 'DISR456',
                            startTime: '14:00',
                            startDate: '09/03/2022',
                            endTime: '22:00',
                            endDate: '09/03/2022',
                        },
                    ],
                };
                wrapper = setup({ data });

                expect(wrapper.find('.incident-effect')).toHaveLength(2);

                const firstEffect = wrapper.find('.incident-effect').at(0);
                const secondEffect = wrapper.find('.incident-effect').at(1);

                expect(firstEffect).toHaveLength(1);
                expect(secondEffect).toHaveLength(1);
            });
        });

        it('should render effect inputs independently of parent disruption times', () => {
            withHooks(() => {
                const data = {
                    ...mockIncident,
                    startTime: '06:00',
                    startDate: '09/03/2022',
                    endTime: '18:00',
                    endDate: '09/03/2022',
                    disruptions: [{
                        ...mockDisruption,
                        startTime: '08:00',
                        startDate: '09/03/2022',
                        endTime: '12:00',
                        endDate: '09/03/2022',
                    }],
                };
                wrapper = setup({ data });

                const effectStartTime = wrapper.find('Input#disruption-creation__wizard-select-details__start-time');
                const effectEndTime = wrapper.find('Input#disruption-creation__wizard-select-details__end-time');

                expect(effectStartTime).toHaveLength(1);
                expect(effectEndTime).toHaveLength(1);
            });
        });
    });
});
