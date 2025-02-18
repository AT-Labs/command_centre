/** @jest-environment jsdom */
import { expect } from 'chai';
import Flatpickr from 'react-flatpickr';
import React from 'react';
import { act } from 'react-dom/test-utils';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import DisruptionDetailView from './DisruptionDetailView';
import { useAlertCauses, useAlertEffects } from '../../../../utils/control/alert-cause-effect';

const mockStore = configureMockStore();

let sandbox;
let wrapper;
let store;

const componentPropsMock = {
    disruption: {},
    shapes: [],
    isRequesting: false,
    updateDisruption: () => { /** Donesnt't need for testing */ },
    routeColors: [],
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
            },
            dataManagement: {
                stopGroupsIncludingDeleted: {},
            },
        },
    });

    return mount(<CacheProvider value={ cache }><Provider store={ store }><DisruptionDetailView { ...props } /></Provider></CacheProvider>);
};

const findElement = (htmlWrapper, elementType, elementText) => htmlWrapper.findWhere(node => node.type() === elementType && node.text() === elementText);

describe('<DisruptionDetailView />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.useFakeTimers(new Date('2022-03-01T06:00:00.000Z'));

        useAlertCauses.mockReturnValue(causes);
        useAlertEffects.mockReturnValue(effects);
    });

    afterEach(() => sandbox.restore());

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

            const saveButton = findElement(wrapper, 'button', 'Save Changes');
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

            const saveButton = findElement(wrapper, 'button', 'Save Changes');
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

            const saveButton = findElement(wrapper, 'button', 'Save Changes');
            expect(saveButton.hasClass('disabled')).to.equal(true);
        });
    });
});
