import React from 'react';
import { shallow } from 'enzyme';
import { withHooks } from 'jest-react-hooks-shallow';
import { DISRUPTION_TYPE, WORKAROUND_TYPES } from '../../../../types/disruptions-types';
import { WorkaroundsForm } from './WorkaroundsForm';
import { routeBasedEffectedEntities } from '../../../../utils/control/disruption-workarounds.spec';

let wrapper;

const defaultState = {
    disruption: {
        disruptionType: DISRUPTION_TYPE.ROUTES,
        affectedEntities: routeBasedEffectedEntities,
    },
    onDataUpdate: jest.fn(),
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
                    affectedEntities: [routeBasedEffectedEntities[0]],
                },
            });
            const radioButtons = wrapper.find('RadioButtons').shallow().find('[type="radio"]');
            expect(radioButtons.at(0).prop('disabled')).toBeFalsy();
            expect(radioButtons.at(1).prop('disabled')).toBeFalsy();
            expect(radioButtons.at(2).prop('disabled')).toBeTruthy();
        });
    });

    describe('behaviours', () => {
        it('Should switch to related workaround input list when selected workaround type', () => {
            setup();
            const radioButtons = wrapper.find('RadioButtons').shallow().find('[type="radio"]');

            expect(wrapper.find('WorkaroundInput').at(0).prop('workaroundType')).toEqual(WORKAROUND_TYPES.all.key);

            radioButtons.at(1).renderProp('onChange')(true);
            expect(wrapper.find('WorkaroundInput').at(0).prop('workaroundType')).toEqual(WORKAROUND_TYPES.route.key);

            radioButtons.at(2).renderProp('onChange')(true);
            expect(wrapper.find('WorkaroundInput').at(0).prop('workaroundType')).toEqual(WORKAROUND_TYPES.stop.key);
        });

        it('Should fire data update with all workaround when input text is updated', () => {
            setup();
            const input = wrapper.find('WorkaroundInput').shallow().find('ForwardRef(TextField)');
            input.renderProp('onChange')({ target: { value: 'workaround text' } });
            expect(defaultState.onDataUpdate).toHaveBeenCalledWith(
                'workarounds',
                [{
                    type: 'all',
                    workaround: 'workaround text',
                }],
            );
        });

        it('Should fire data update with workarounds for route when swithed to route and input text is updated', () => {
            setup();
            const radioButtons = wrapper.find('RadioButtons').shallow().find('[type="radio"]');
            radioButtons.at(1).renderProp('onChange')(true);

            const input = wrapper.find('WorkaroundInput').at(2).shallow().find('ForwardRef(TextField)');
            input.renderProp('onChange')({ target: { value: 'workaround text' } });
            expect(defaultState.onDataUpdate).toHaveBeenCalledWith('workarounds', [{
                type: 'route',
                workaround: 'workaround text',
                routeShortName: 'NX2',
                stopCode: '4222',
            }, {
                type: 'route',
                workaround: 'workaround text',
                routeShortName: 'NX2',
                stopCode: '7037',
            }]);
        });
    });

    describe('hooks', () => {
        it('Should update workarounds if affectedEntities is updated', () => {
            const disruption = {
                disruptionType: DISRUPTION_TYPE.ROUTES,
                affectedEntities: [routeBasedEffectedEntities[0]],
                workarounds: [{
                    type: 'route',
                    workaround: 'workaround text',
                    routeShortName: '83',
                }],
            };

            withHooks(() => {
                setup({ disruption });

                expect(defaultState.onDataUpdate).toHaveBeenCalledWith(
                    'workarounds',
                    [{
                        type: 'route',
                        routeShortName: '83',
                        workaround: 'workaround text',
                    }],
                );

                wrapper.setProps({ disruption: {
                    ...disruption,
                    affectedEntities: [routeBasedEffectedEntities[1]],
                } });

                expect(defaultState.onDataUpdate).toHaveBeenCalledWith('workarounds', []);
            });
        });
    });
});
