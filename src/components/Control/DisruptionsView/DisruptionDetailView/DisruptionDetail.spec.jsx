/** @jest-environment jsdom */
import { expect } from 'chai';
import React from 'react';
import { act } from 'react-dom/test-utils';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import Flatpickr from 'react-flatpickr';
import DisruptionDetail from './DisruptionDetail';
import { useAlertCauses, useAlertEffects } from '../../../../utils/control/alert-cause-effect';
import { useDiversion, useDraftDisruptions } from '../../../../redux/selectors/appSettings';
import DisruptionSummaryModal from '../DisruptionDetail/DisruptionSummaryModal';
import ACTION_TYPE from '../../../../redux/action-types';
import { ViewDiversionDetailModal } from '../DisruptionDetail/ViewDiversionDetailModal';

jest.mock('../../../../redux/selectors/appSettings');

const mockGetDiversion = jest.fn();
jest.mock('../../../../utils/transmitters/disruption-mgt-api', () => ({
    ...(jest.requireActual('../../../../utils/transmitters/disruption-mgt-api')),
    getDiversion: diversions => mockGetDiversion(diversions),
}));

const mockStore = configureMockStore([thunk]);

let sandbox;
let wrapper;
let store;

const componentPropsMock = {
    disruption: {},
    shapes: [],
    isRequesting: false,
    updateDisruption: () => jest.fn(),
    routeColors: [],
    publishDraftDisruption: () => jest.fn(),
};

const stop = { stopId: '105-474861ff', stopCode: '105' };
const baseDisruption = {
    startTime: '2022-03-09T06:00:00.000Z',
    endTime: '2022-04-20T03:00:00.000Z',
    impact: 'CANCELLATIONS',
    cause: 'BUNKERING_THRUSTERS',
    mode: '-',
    status: 'in-progress',
    header: 'Title',
    description: 'Description',
    url: 'https://at.govt.nz',
    createNotification: false,
    duration: '2',
    recurrencePattern: {
        freq: 2,
        dtstart: new Date('2022-03-09T06:00:00.000Z'),
        until: new Date('2022-03-10T06:00:00.000Z'),
        byweekday: [0],
    },
    activePeriods: [{ startTime: 1328227200, endTime: 1328486400 }],
    affectedEntities: [stop],
    notes: [
        {
            id: '9d1ae55b-67ca-413c-9f18-69a0d7e579f7',
            createdBy: 'jonathan.nenba@propellerhead.co.nz',
            createdTime: '2022-10-05T14:03:58.340Z',
            description: 'test the disruption notes feature',
        },
    ],
    severity: 'MINOR',
};

const causes = [{ label: 'Bunkering, Thrusters', value: 'BUNKERING_THRUSTERS' }];
const effects = [{ label: 'Cancellations', value: 'CANCELLATIONS' }];

jest.mock('../../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: jest.fn(),
    useAlertEffects: jest.fn(),
}));

const cache = createCache({ key: 'blah' });

const setup = (customProps) => {
    let props = componentPropsMock;
    props = Object.assign(props, customProps);

    store = mockStore({
        control: {
            disruptions: {
                affectedEntities: {
                    affectedStops: [stop],
                    affectedRoutes: [],
                },
                activeStep: 1,
                action: { isRequesting: false },
            },
            dataManagement: {
                stopGroupsIncludingDeleted: {},
            },
        },
    });

    return mount(<CacheProvider value={ cache }><Provider store={ store }><DisruptionDetail { ...props } /></Provider></CacheProvider>);
};

const findElement = (htmlWrapper, elementType, elementText) => htmlWrapper.findWhere(node => node.type() === elementType && node.text() === elementText);

describe('<DisruptionDetailView />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.useFakeTimers(new Date('2022-03-01T06:00:00.000Z'));

        useAlertCauses.mockReturnValue(causes);
        useAlertEffects.mockReturnValue(effects);
        useDraftDisruptions.mockReturnValue(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
        sandbox.restore();
    });

    describe('Save button', () => {
        it('Save button should not be disabled when it is not recurrent and set endDate to empty', () => {
            wrapper = setup(
                {
                    disruption: {
                        ...baseDisruption,
                        recurrent: false,
                    },
                    stops: [stop],
                },
            );

            const endDateInput = wrapper.find(Flatpickr);
            act(() => {
                endDateInput.at(1).props().onChange('');
            });
            wrapper.update();

            const saveButton = findElement(wrapper, 'button', 'Save');
            expect(saveButton.hasClass('disabled')).to.equal(false);
        });

        it('Save button should be disabled when it is recurrent and set endDate to empty', () => {
            wrapper = setup(
                {
                    disruption: {
                        ...baseDisruption,
                        recurrent: true,
                    },
                    stops: [stop],
                },
            );

            const endDateInput = wrapper.find(Flatpickr);
            act(() => {
                endDateInput.at(1).props().onChange('');
            });
            wrapper.update();

            const saveButton = findElement(wrapper, 'button', 'Save');
            expect(saveButton.hasClass('disabled')).to.equal(true);
        });
    });

    describe('Recurrence', () => {
        it('Should not be able to save or view all when there is no day selected on the Week component', () => {
            wrapper = setup(
                {
                    disruption: {
                        ...baseDisruption,
                        recurrent: true,
                        recurrencePattern: {
                            freq: 2,
                            dtstart: new Date('2022-03-09T06:00:00.000Z'),
                            until: new Date('2022-03-10T06:00:00.000Z'),
                            byweekday: [], // no day selected
                        },
                    },
                    stops: [stop],
                },
            );

            const viewAllButton = findElement(wrapper, 'button', 'View all');
            expect(viewAllButton.hasClass('disabled')).to.equal(true);

            const saveButton = findElement(wrapper, 'button', 'Save');
            expect(saveButton.hasClass('disabled')).to.equal(true);
        });
    });

    describe('Draft', () => {
        it('Draft buttons should be displayed', () => {
            useDraftDisruptions.mockReturnValue(true);
            wrapper = setup(
                {
                    disruption: {
                        ...baseDisruption,
                        status: 'draft',
                    },
                },
            );

            const saveButton = findElement(wrapper, 'button', 'Save draft');
            const publishButton = findElement(wrapper, 'button', 'Publish');
            const previewButton = findElement(wrapper, 'button', 'Preview');

            expect(saveButton.exists()).to.be.true; // eslint-disable-line
            expect(publishButton.exists()).to.be.true; // eslint-disable-line
            expect(previewButton.exists()).to.be.true; // eslint-disable-line
        });

        it('Draft buttons should not be displayed when useDraftDisruptions false and status not draft', () => {
            wrapper = setup(
                {
                    disruption: {
                        ...baseDisruption,
                        status: 'draft',
                    },
                },
            );

            const saveButton = findElement(wrapper, 'button', 'Save draft');
            const publishButton = findElement(wrapper, 'button', 'Publish');
            const previewButton = findElement(wrapper, 'button', 'Preview');

            expect(saveButton.exists()).to.be.false; // eslint-disable-line
            expect(publishButton.exists()).to.be.false; // eslint-disable-line
            expect(previewButton.exists()).to.be.false; // eslint-disable-line
        });

        it('Save draft should not be disabled when required fields are empty', () => {
            useDraftDisruptions.mockReturnValue(true);

            wrapper = setup(
                {
                    disruption: {
                        status: 'draft',
                        endTime: undefined,
                        startDate: undefined,
                        startTime: undefined,
                        endDate: undefined,
                        duration: '',
                        url: '',
                        impact: '',
                        cause: 'BUNKERING_THRUSTERS',
                        severity: '',
                        notes: [],
                        header: 'header',
                        activePeriods: [],
                        affectedEntities: [],
                        recurrent: false,
                    },
                },
            );

            const saveButton = findElement(wrapper, 'button', 'Save draft');
            expect(saveButton.hasClass('disabled')).to.equal(false);
        });

        it('Publish recurrence draft should with invalid weekday should open modal', () => {
            useDraftDisruptions.mockReturnValue(true);

            wrapper = setup(
                {
                    disruption: {
                        ...baseDisruption,
                        status: 'draft',
                    },
                },
            );

            const saveButton = findElement(wrapper, 'button', 'Publish');
            expect(saveButton.hasClass('disabled')).to.equal(false);
        });

        it('should call setDisruptionsDetailsModalOpen with true on Preview button click', () => {
            useDraftDisruptions.mockReturnValue(true);
            wrapper = setup(
                {
                    disruption: {
                        ...baseDisruption,
                        status: 'draft',
                    },
                },
            );

            const previewButton = findElement(wrapper, 'button', 'Preview');
            expect(previewButton.exists()).to.be.true; // eslint-disable-line
            previewButton.simulate('click');

            wrapper.update();

            const modal = wrapper.find(DisruptionSummaryModal);
            expect(modal.prop('isModalOpen')).to.be.true; // eslint-disable-line
        });

        it('should call publishDraft on Publish button click', () => {
            useDraftDisruptions.mockReturnValue(true);

            wrapper = setup(
                {
                    disruption: {
                        ...baseDisruption,
                        status: 'draft',
                    },
                },
            );

            const saveButton = findElement(wrapper, 'button', 'Publish');
            expect(saveButton.hasClass('disabled')).to.equal(false);
            saveButton.simulate('click');

            const action = store.getActions().find(a => a.type === ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_REQUESTING);
            expect(action).to.not.be.undefined; // eslint-disable-line
            expect(JSON.stringify(action.payload)).to.contain('"isRequesting":true');
        });

        it('should call updateDraft on Save draft button click', () => {
            useDraftDisruptions.mockReturnValue(true);
            wrapper = setup(
                {
                    disruption: {
                        ...baseDisruption,
                        status: 'draft',
                    },
                },
            );

            const saveButton = findElement(wrapper, 'button', 'Save draft');
            expect(saveButton.hasClass('disabled')).to.equal(false);
            saveButton.simulate('click');

            const action = store.getActions().find(a => a.type === ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_REQUESTING);
            expect(action).to.not.be.undefined; // eslint-disable-line
            expect(JSON.stringify(action.payload)).to.contain('"isRequesting":true');
        });
    });

    describe('ViewDiversionModal', () => {
        it('should call open and then close on the diversion modal', () => {
            useDiversion.mockReturnValue(true);
            const newBaseDisruption = { ...baseDisruption };
            newBaseDisruption.affectedEntities.push({ routeType: 3 });
            wrapper = setup(
                {
                    disruption: {
                        ...newBaseDisruption,
                    },
                },
            );

            const viewEditDiversionButton = findElement(wrapper, 'button', 'View & edit diversions (0)');
            viewEditDiversionButton.simulate('click');

            const closeDiversions = findElement(wrapper, 'button', 'Close');
            closeDiversions.simulate('click');

            expect(wrapper.find(ViewDiversionDetailModal).exists()).to.be.true; // eslint-disable-line
            expect(wrapper.find('button').at(3).text()).to.equal('View & edit diversions (0)');
        });
    });
});
