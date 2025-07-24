import React from 'react';
import { shallow } from 'enzyme';
import { withHooks } from 'jest-react-hooks-shallow';
import { DISRUPTION_TYPE, WORKAROUND_TYPES } from '../../../../types/disruptions-types';
import { WorkaroundsForm } from './WorkaroundsForm';
import { routeBasedEffectedEntities, stopBasedEffectedEntities } from '../../../../utils/control/disruption-workarounds.spec';

let wrapper;

const routeBasedEffectedEntitiesSelectedStops = [
    {
        category: { type: 'route', icon: '', label: 'Routes' },
        labelKey: 'routeShortName',
        parentStationStopId: '122-34ecc043',
        parentStationStopName: 'Kingsland Train Station',
        routeId: 'WEST-201',
        routeShortName: 'WEST',
        routeType: 2,
        stopCode: '9304',
        stopId: '9304-dcb2ed75',
        stopName: 'Kingsland Train Station 1',
        text: 'WEST',
        type: 'route',
        valueKey: 'routeId',
    },
    {
        category: { type: 'route', icon: '', label: 'Routes' },
        parentStationStopCode: '129',
        parentStationStopId: '129-f22f268a',
        parentStationStopName: 'New Lynn Train Station',
        routeId: 'WEST-201',
        routeShortName: 'WEST',
        stopCode: '9314',
        stopId: '9314-15d82116',
        stopName: 'New Lynn Train Station 1',
        stopSequence: 1,
        text: 'WEST',
        type: 'route',
        valueKey: 'routeId',
    },
];

const defaultState = {
    disruption: {
        disruptionType: DISRUPTION_TYPE.ROUTES,
        affectedEntities: {
            affectedRoutes: routeBasedEffectedEntities,
            affectedStops: [],
        },
    },
    onWorkaroundUpdate: jest.fn(),
};

function setup(customProps) {
    const props = { ...defaultState };

    Object.assign(props, customProps);

    wrapper = shallow(<WorkaroundsForm { ...props } />);
}

describe('<WorkaroundsForm />', () => {
    afterEach(() => {
        wrapper = null;
        jest.resetAllMocks();
    });

    describe('render', () => {
        it('Should render', () => {
            setup();
            expect(wrapper.exists()).toEqual(true);
            expect(wrapper.find('RadioButtons').render().find('[type="radio"]')).toHaveLength(3);
            expect(wrapper.find('WorkaroundInput')).toHaveLength(1);
        });

        it('Should disable the option if no entity with the same type', () => {
            setup({
                disruption: {
                    disruptionType: DISRUPTION_TYPE.ROUTES,
                    affectedEntities: {
                        affectedRoutes: [routeBasedEffectedEntities[0]],
                        affectedStops: [],
                    },
                },
            });
            const radioButtons = wrapper.find('RadioButtons').shallow().find('[type="radio"]');
            expect(radioButtons.at(0).prop('disabled')).toBeFalsy();
            expect(radioButtons.at(1).prop('disabled')).toBeFalsy();
            expect(radioButtons.at(2).prop('disabled')).toBeTruthy();
        });
    });

    describe('behaviors', () => {
        it('Should switch to related workaround input list when selected workaround type', () => {
            setup({
                disruption: {
                    disruptionType: DISRUPTION_TYPE.ROUTES,
                    affectedEntities: {
                        affectedRoutes: routeBasedEffectedEntitiesSelectedStops,
                        affectedStops: [],
                    },
                },
            });
            const radioButtons = wrapper.find('RadioButtons').shallow().find('[type="radio"]');

            expect(wrapper.find('WorkaroundInput').at(0).prop('workaroundType')).toEqual(WORKAROUND_TYPES.all.key);

            radioButtons.at(1).renderProp('onChange')(true);
            expect(wrapper.find('WorkaroundInput').at(0).prop('workaroundType')).toEqual(WORKAROUND_TYPES.route.key);

            radioButtons.at(2).renderProp('onChange')(true);
            expect(wrapper.find('WorkaroundInput').at(0).prop('workaroundType')).toEqual(WORKAROUND_TYPES.stop.key);
        });
    });

    describe('hooks', () => {
        it('Should update workarounds if affectedEntities is updated', () => {
            const disruption = {
                disruptionType: DISRUPTION_TYPE.ROUTES,
                affectedEntities: {
                    affectedRoutes: [routeBasedEffectedEntities[0]],
                    affectedStops: [],
                },
                workarounds: [{
                    type: 'route',
                    workaround: 'workaround text',
                    routeShortName: '83',
                }],
            };

            withHooks(() => {
                setup({ disruption });

                const radioButtons = wrapper.find('RadioButtons').shallow().find('[type="radio"]');
                expect(radioButtons.at(0).prop('disabled')).toBeFalsy();
                expect(radioButtons.at(1).prop('disabled')).toBeFalsy();
                expect(radioButtons.at(2).prop('disabled')).toBeTruthy();

                wrapper.setProps({ disruption: {
                    ...disruption,
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [stopBasedEffectedEntities[3]],
                    },
                } });

                const radioButtonsAfterUpdate = wrapper.find('RadioButtons').shallow().find('[type="radio"]');
                expect(radioButtonsAfterUpdate.at(0).prop('disabled')).toBeFalsy();
                expect(radioButtonsAfterUpdate.at(1).prop('disabled')).toBeTruthy();
                expect(radioButtonsAfterUpdate.at(2).prop('disabled')).toBeFalsy();
            });
        });
    });
});
