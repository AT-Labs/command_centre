import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { withHooks } from 'jest-react-hooks-shallow';
import { RRule } from 'rrule';
import { SelectEffects } from './SelectEffects';
import Footer from './Footer';
import SelectEffectEntities from './SelectEffectEntities';
import * as controlUtils from '../../../../../utils/control/alert-cause-effect';
import EDIT_TYPE from '../../../../../types/edit-types';
import { DISRUPTION_TYPE, getParentChildDefaultSeverity, STATUSES } from '../../../../../types/disruptions-types';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';

let sandbox;
let wrapper;

jest.useFakeTimers();
jest.mock('../../../../../utils/control/alert-cause-effect');

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
            routeShortName: 'WEST',
            routeType: 2,
            text: 'WEST',
            type: 'route',
            valueKey: 'routeId',
        }],
        affectedStops: [],
    },
};

const mockIncident = {
    startTime: '06:00',
    startDate: '09/03/2022',
    impact: 'CANCELLATIONS',
    endTime: '06:00',
    endDate: '10/03/2022',
    cause: 'CAPACITY_ISSUE',
    mode: '-',
    status: 'not-started',
    header: 'Incident Title',
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
    disruptions: [{ ...mockDisruption }],
    modalOpenedTime: new Date('2022-03-01T05:59:00.000Z'),
};

const INIT_INCIDENT_STATE = {
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    cause: DEFAULT_CAUSE.value,
    activePeriods: [],
    mode: '-',
    status: STATUSES.NOT_STARTED,
    header: '',
    description: '',
    createNotification: false,
    recurrent: false,
    duration: '',
    recurrencePattern: { freq: RRule.WEEKLY },
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: getParentChildDefaultSeverity().value,

    notes: '',
    disruptions: [],
};

const componentPropsMock = {
    data: { ...mockIncident },
    onStepUpdate: jest.fn(),
    onDataUpdate: jest.fn(),
    onSubmit: jest.fn(),
    updateCurrentStep: jest.fn(),
    stops: {},
    toggleIncidentModals: jest.fn(),
    onSubmitDraft: jest.fn(),
    onUpdateDetailsValidation: jest.fn(),
    useDraftDisruptions: jest.fn(),
    onSubmitUpdate: jest.fn(),
    updateAffectedStopsState: jest.fn(),
    updateAffectedRoutesState: jest.fn(),
    getRoutesByShortName: jest.fn(),
    affectedRoutes: [],
    editMode: EDIT_TYPE.CREATE,
    stopGroups: {},
    onUpdateEntitiesValidation: jest.fn(),
    newIncidentEffect: {},
    updateNewIncidentEffect: jest.fn(),
    clearAffectedRoutes: jest.fn(),
    clearAffectedStops: jest.fn(),
    clearMapDrawingEntities: jest.fn(),
};
controlUtils.useAlertEffects.mockReturnValue([impacts]);

const setup = (customProps) => {
    const props = {
        ...componentPropsMock,
        useDraftDisruptions: false,
        ...customProps,
    };
    Object.assign(props, customProps);
    return shallow(<SelectEffects { ...props } />);
};

describe('<SelectEffects />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.useFakeTimers(new Date('2022-03-01T06:00:00.000Z'));
        wrapper = setup();
    });

    afterEach(() => {
        sandbox.restore();
        jest.clearAllMocks();
    });

    it('Should render', () => {
        expect(wrapper.exists()).toEqual(true);
    });

    it('Should render with valid fields for recurrent disruption', () => {
        expect(wrapper.find('#disruption-creation__wizard-select-details__header').props().value).toBe('Incident Title');
        expect(wrapper.find('#disruption-creation__wizard-select-details__impact').props().value).toBe(impacts[1].value);
        expect(wrapper.find('#disruption-creation__wizard-select-details__severity').props().value).toBe('MINOR');
        expect(wrapper.find('#disruption-creation__wizard-select-details__start-date').props().value).toBe('09/03/2022');
        expect(wrapper.find('#disruption-creation__wizard-select-details__end-date').props().value).toBe('10/03/2022');
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__start-time').props().value).toBe('06:00');
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__duration').props().value).toBe('2');
    });

    it('Should render with default fields for not recurrent disruption if incident data is not valid', () => {
        sandbox.useFakeTimers(new Date('2022-03-01T07:12:00.000Z'));
        const data = {
            ...INIT_INCIDENT_STATE,
            recurrent: false,
            disruptions: [],
        };
        wrapper = setup({ data });
        expect(wrapper.find('#disruption-creation__wizard-select-details__header').props().value).toBe('');
        expect(wrapper.find('#disruption-creation__wizard-select-details__impact').props().value).toBe(DEFAULT_IMPACT.value);
        expect(wrapper.find('#disruption-creation__wizard-select-details__severity').props().value).toBe(getParentChildDefaultSeverity().value);
        expect(wrapper.find('#disruption-creation__wizard-select-details__start-date').props().value).toBe('01/03/2022');
        expect(wrapper.find('#disruption-creation__wizard-select-details__end-date').props().value).toBe('');
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__start-time').props().value).toMatch(/:12$/);
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__end-time').props().value).toBe('');
    });

    it('Should render with valid fields for not recurrent disruption', () => {
        const data = {
            ...mockIncident,
            recurrent: false,
            disruptions: [{ ...mockDisruption, recurrent: false }],
        };
        wrapper = setup({ data });
        expect(wrapper.find('#disruption-creation__wizard-select-details__header').props().value).toBe('Incident Title');
        expect(wrapper.find('#disruption-creation__wizard-select-details__impact').props().value).toBe(impacts[1].value);
        expect(wrapper.find('#disruption-creation__wizard-select-details__severity').props().value).toBe('MINOR');
        expect(wrapper.find('#disruption-creation__wizard-select-details__start-date').props().value).toBe('09/03/2022');
        expect(wrapper.find('#disruption-creation__wizard-select-details__end-date').props().value).toBe('10/03/2022');
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__start-time').props().value).toBe('06:00');
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__end-time').props().value).toBe('06:00');
    });

    it('Should render with default fields for recurrent disruption if incident data is not valid', () => {
        sandbox.useFakeTimers(new Date('2022-03-01T07:12:00.000Z'));
        const data = {
            ...INIT_INCIDENT_STATE,
            recurrent: true,
            disruptions: [],
        };
        wrapper = setup({ data });
        expect(wrapper.find('#disruption-creation__wizard-select-details__header').props().value).toBe('');
        expect(wrapper.find('#disruption-creation__wizard-select-details__impact').props().value).toBe(DEFAULT_IMPACT.value);
        expect(wrapper.find('#disruption-creation__wizard-select-details__severity').props().value).toBe(getParentChildDefaultSeverity().value);
        expect(wrapper.find('#disruption-creation__wizard-select-details__start-date').props().value).toBe('01/03/2022');
        expect(wrapper.find('#disruption-creation__wizard-select-details__end-date').props().value).toBe('');
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__start-time').props().value).toMatch(/:12$/);
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__duration').props().value).toBe('');
    });

    it('Should render with valid init value for add effect mode', () => {
        const data = {
            ...mockIncident,
            recurrent: false,
            disruptions: [{ ...mockDisruption, recurrent: false }],
        };
        wrapper = setup({ data, editMode: EDIT_TYPE.ADD_EFFECT });
        expect(wrapper.find('#disruption-creation__wizard-select-details__header').props().value).toBe('Incident Title');
        expect(wrapper.find('#disruption-creation__wizard-select-details__impact').props().value).toBe(impacts[0].value); // default value
        expect(wrapper.find('#disruption-creation__wizard-select-details__severity').props().value).toBe('MINOR'); // values from incident below
        expect(wrapper.find('#disruption-creation__wizard-select-details__start-date').props().value).toBe('09/03/2022');
        expect(wrapper.find('#disruption-creation__wizard-select-details__end-date').props().value).toBe('10/03/2022');
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__start-time').props().value).toBe('06:00');
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__end-time').props().value).toBe('06:00');
    });

    it('Should render with valid value from newIncidentEffect', () => {
        const data = {
            ...mockIncident,
            recurrent: false,
            disruptions: [{ ...mockDisruption, recurrent: false }],
        };
        wrapper = setup({ data, editMode: EDIT_TYPE.ADD_EFFECT, newIncidentEffect: { ...mockDisruption, impact: impacts[4].value, severity: 'HEADLINE', key: 'DISR321' } });
        expect(wrapper.find('#disruption-creation__wizard-select-details__impact').props().value).toBe(impacts[4].value);
        expect(wrapper.find('#disruption-creation__wizard-select-details__severity').props().value).toBe('HEADLINE');
    });

    describe('Submit button', () => {
        let data;

        beforeEach(() => {
            data = {
                ...mockIncident,
                disruptions: [{ ...mockDisruption }],
            };
        });

        it('Should be disabled when title is empty', () => {
            data.disruptions = [{ ...mockDisruption, header: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when startTime is empty', () => {
            data.disruptions = [{ ...mockDisruption, startTime: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when startDate is empty', () => {
            data.disruptions = [{ ...mockDisruption, startDate: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when impact is empty', () => {
            data.disruptions = [{ ...mockDisruption, impact: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when cause is empty', () => {
            data.cause = '';
            data.disruptions = [{ ...mockDisruption, cause: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when header is empty', () => {
            data.header = '';
            data.disruptions = [{ ...mockDisruption, header: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when disruption is recurrent and end date is empty', () => {
            data.disruptions = [{ ...mockDisruption, recurrent: true, endDate: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when disruption is not recurrent, end time is not empty and end date is empty', () => {
            data.disruptions = [{ ...mockDisruption, recurrent: false, endDate: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when disruption is recurrent and duration is empty', () => {
            data.disruptions = [{ ...mockDisruption, recurrent: true, duration: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when disruption is recurrent and no weekday is selected', () => {
            data.disruptions = [{ ...mockDisruption, recurrent: true, duration: '' }];
            data.disruptions[0].recurrencePattern.byweekday = [];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when startTime is invalid', () => {
            data.disruptions = [{ ...mockDisruption, startTime: '0600' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when startDate is invalid', () => {
            data.disruptions = [{ ...mockDisruption, startDate: '09-03-2022' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when endTime is invalid', () => {
            data.disruptions = [{ ...mockDisruption, endTime: '0600' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when endDate is invalid', () => {
            data.disruptions = [{ ...mockDisruption, endDate: '10-03-2022' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when duration is invalid', () => {
            data.disruptions = [{ ...mockDisruption, duration: '36' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('Should not be disabled when disruption is not recurrent, all required fields are set and valid', () => {
            data.recurrent = false;
            data.disruptions = [{ ...mockDisruption, recurrent: false }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(false);
        });

        it('Should not be disabled when disruption is recurrent, all required fields are set and valid', () => {
            data.recurrent = true;
            data.disruptions = [{ ...mockDisruption, recurrent: true }];
            data.disruptions[0].recurrencePattern.byweekday = [0, 1, 2];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(false);
        });

        it('Should fire step update and updateNewIncidentEffect when next button is clicked whe is add effect mode', () => {
            data.recurrent = false;
            data.disruptions = [{ ...mockDisruption, recurrent: false }];
            wrapper = setup({ data, editMode: EDIT_TYPE.ADD_EFFECT, newIncidentEffect: { ...mockDisruption, impact: impacts[4].value, severity: 'HEADLINE', key: 'DISR321' } });
            const footer = wrapper.find(Footer);
            expect(footer.prop('nextButtonValue')).toEqual('Continue');
            footer.renderProp('onContinue')();
            expect(componentPropsMock.updateNewIncidentEffect).toHaveBeenCalled();
            expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(1);
            expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(3);
        });

        it('Should fire step update when next button is clicked', () => {
            data.recurrent = false;
            data.disruptions = [{ ...mockDisruption, recurrent: false }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('nextButtonValue')).toEqual('Continue');
            footer.renderProp('onContinue')();
            expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(2);
            expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(3);
        });

        it('Should fire step update when active periods valid', () => {
            data.recurrent = true;
            data.disruptions = [{ ...mockDisruption, recurrent: true, recurrencePattern: { ...data.recurrencePattern, byweekday: [0, 1, 2, 3, 4, 5, 6] } }];
            wrapper = setup({ data, useDraftDisruptions: true });
            const footer = wrapper.find(Footer);
            expect(footer.prop('nextButtonValue')).toEqual('Continue');
            footer.renderProp('onContinue')();
            expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(2);
            expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(3);
            expect(componentPropsMock.onUpdateEntitiesValidation).toHaveBeenCalledWith(true);
        });

        it('Should fire step update when active periods invalid', () => {
            data.recurrent = true;
            data.disruptions = [{ ...mockDisruption, recurrent: true }];
            data.disruptions[0].recurrencePattern.byweekday = [0];
            wrapper = setup({ data, useDraftDisruptions: true });
            const footer = wrapper.find(Footer);
            expect(footer.prop('nextButtonValue')).toEqual('Continue');
            footer.renderProp('onContinue')();
            expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(2);
            expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(3);
            expect(componentPropsMock.onUpdateEntitiesValidation).toHaveBeenCalledWith(false);
        });
    });

    describe('Save draft button', () => {
        let data;

        beforeEach(() => {
            data = {
                ...mockIncident,
                disruptions: [{ ...mockDisruption }],
            };
        });

        it('Should be disabled when cause is empty', () => {
            data.cause = '';
            data.disruptions = [{ ...mockDisruption, cause: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isDraftSubmitDisabled')).toEqual(true);
        });

        it('Should be disabled when header is empty', () => {
            data.header = '';
            data.disruptions = [{ ...mockDisruption, header: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isDraftSubmitDisabled')).toEqual(true);
        });

        it('Should be enabled when header and cause not empty', () => {
            data.disruptions = [{ ...mockDisruption }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isDraftSubmitDisabled')).toEqual(false);
        });

        it('Should fire step update when next button is clicked', () => {
            data.recurrent = false;
            data.disruptions = [{ ...mockDisruption, recurrent: false }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            footer.prop('onSubmitDraft')();
            expect(componentPropsMock.onDataUpdate).toHaveBeenCalled();
        });
    });

    describe('Finish button', () => {
        let data;

        beforeEach(() => {
            data = {
                ...mockIncident,
                disruptions: [{ ...mockDisruption }],
            };
        });

        it('Should be disabled when impact is empty', () => {
            data.cause = '';
            data.disruptions = [{ ...mockDisruption, impact: '' }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isAdditionalFinishButtonDisabled')).toEqual(true);
        });

        it('Should be enabled when all fields filled', () => {
            data.disruptions = [{ ...mockDisruption }];
            wrapper = setup({ data, isDetailsValid: true });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isAdditionalFinishButtonDisabled')).toEqual(false);
        });

        it('Should fire step update when next button is clicked', () => {
            data.recurrent = false;
            data.disruptions = [{ ...mockDisruption, recurrent: false }];
            wrapper = setup({ data });
            const footer = wrapper.find(Footer);
            footer.prop('onAdditionalFinishButtonClick')();
            expect(componentPropsMock.onDataUpdate).toHaveBeenCalled();
        });
    });

    describe('Test hooks', () => {
        let data;

        beforeEach(() => {
            data = {
                ...mockIncident,
                disruptions: [{ ...mockDisruption }],
            };
        });

        it('Should rerender effects after updating filtering value', () => {
            withHooks(() => {
                wrapper = setup({ data });
                const newAffectedRoutes = [{
                    category: { type: 'route', icon: '', label: 'Routes' },
                    labelKey: 'routeShortName',
                    routeId: 'WEST-201',
                    routeShortName: 'WEST',
                    routeType: 2,
                    text: 'WEST',
                    type: 'route',
                    valueKey: 'routeId',
                }, {
                    category: { type: 'route', icon: '', label: 'Routes' },
                    labelKey: 'routeShortName',
                    routeId: 'EAST-201',
                    routeShortName: 'EAST',
                    routeType: 2,
                    text: 'EAST',
                    type: 'route',
                    valueKey: 'routeId',
                },
                ];
                const selectEffectEntities = wrapper.find(SelectEffectEntities);
                selectEffectEntities.prop('onAffectedEntitiesUpdate')('DISR123', 'affectedRoutes', newAffectedRoutes);
                wrapper.update();
                jest.advanceTimersByTime(100);
                expect(componentPropsMock.updateAffectedRoutesState).toHaveBeenCalled();
                expect(componentPropsMock.getRoutesByShortName).toHaveBeenCalled();
            });
        });

        it('Should rerender effects form with new one after clicking "+" button', () => {
            withHooks(() => {
                wrapper = setup({ data });
                expect(wrapper.find('.incident-effect')).toHaveLength(1);
                wrapper.find('.add-disruption-button').simulate('click');
                wrapper.update();
                expect(wrapper.find('.incident-effect')).toHaveLength(2);
            });
        });

        it('Should render effects form without one effect after clicking "-" button', () => {
            withHooks(() => {
                data.disruptions = [{ ...mockDisruption }, { ...mockDisruption, key: 'DISR456', impact: impacts[4].value }];
                wrapper = setup({ data });
                expect(wrapper.find('.incident-effect')).toHaveLength(2);
                wrapper.find('.disruption-effect-button').at(0).simulate('click');
                wrapper.update();
                expect(wrapper.find('.incident-effect')).toHaveLength(1);
                expect(wrapper.find('#disruption-creation__wizard-select-details__impact').props().value).toBe(impacts[4].value);
            });
        });
    });

    describe('Entity Limit Validation', () => {
        let data;

        beforeEach(() => {
            data = {
                ...mockIncident,
                disruptions: [{ ...mockDisruption }],
            };
        });

        const createDisruptionWithEntities = (routesCount, stopsCount) => ({
            ...mockDisruption,
            affectedEntities: {
                affectedRoutes: Array(routesCount).fill().map((_, i) => ({
                    category: { type: 'route', icon: '', label: 'Routes' },
                    labelKey: 'routeShortName',
                    routeId: `ROUTE-${i}`,
                    routeShortName: `ROUTE${i}`,
                    routeType: 2,
                    text: `ROUTE${i}`,
                    type: 'route',
                    valueKey: 'routeId',
                })),
                affectedStops: Array(stopsCount).fill().map((_, i) => ({
                    category: { type: 'stop', icon: '', label: 'Stops' },
                    labelKey: 'stopCode',
                    stopCode: `STOP${i}`,
                    stopName: `Stop ${i}`,
                    type: 'stop',
                    valueKey: 'stopCode',
                })),
            },
        });

        it('should show alert modal when entities exceed 200 limit', () => {
            const disruption = createDisruptionWithEntities(150, 100);
            const props = {
                ...componentPropsMock,
                data: { ...data, disruptions: [disruption] },
            };
            wrapper = setup(props);

            const footer = wrapper.find(Footer);
            footer.renderProp('onContinue')();

            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(true);
            expect(wrapper.find('IncidentLimitModal').prop('totalEntities')).toBe(250);
        });

        it('should not show alert modal when entities are within 200 limit', () => {
            const disruption = createDisruptionWithEntities(100, 50);
            const props = {
                ...componentPropsMock,
                data: { ...data, disruptions: [disruption] },
            };
            wrapper = setup(props);

            const footer = wrapper.find(Footer);
            footer.renderProp('onContinue')();

            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(false);
        });

        it('should show alert modal when entities are exactly 200', () => {
            const disruption = createDisruptionWithEntities(100, 100);
            const props = {
                ...componentPropsMock,
                data: { ...data, disruptions: [disruption] },
            };
            wrapper = setup(props);

            const footer = wrapper.find(Footer);
            footer.renderProp('onContinue')();

            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(false);
        });

        it('should show alert modal when entities exceed 200 limit on finish', () => {
            const disruption = createDisruptionWithEntities(150, 100);
            const props = {
                ...componentPropsMock,
                data: { ...data, disruptions: [disruption] },
            };
            wrapper = setup(props);

            const footer = wrapper.find(Footer);
            footer.renderProp('onAdditionalFinishButtonClick')();

            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(true);
            expect(wrapper.find('IncidentLimitModal').prop('totalEntities')).toBe(250);
        });

        it('should not show alert modal when entities are within 200 limit on finish', () => {
            const disruption = createDisruptionWithEntities(100, 50);
            const props = {
                ...componentPropsMock,
                data: { ...data, disruptions: [disruption] },
            };
            wrapper = setup(props);

            const footer = wrapper.find(Footer);
            footer.renderProp('onAdditionalFinishButtonClick')();

            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(false);
        });

        it('should handle empty affected entities', () => {
            const disruption = {
                ...mockDisruption,
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
            };
            const props = {
                ...componentPropsMock,
                data: { ...data, disruptions: [disruption] },
            };
            wrapper = setup(props);

            const footer = wrapper.find(Footer);
            footer.renderProp('onContinue')();

            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(false);
        });

        it('should close modal when onClose is called', () => {
            const disruption = createDisruptionWithEntities(150, 100);
            const props = {
                ...componentPropsMock,
                data: { ...data, disruptions: [disruption] },
            };
            wrapper = setup(props);

            const footer = wrapper.find(Footer);
            footer.renderProp('onContinue')();

            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(true);

            const modal = wrapper.find('IncidentLimitModal');
            modal.prop('onClose')();

            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(false);
        });
    });
});
