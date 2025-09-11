/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { useDiversionsLogic } from './useDiversionsLogic';

jest.useFakeTimers();

const TestComponent = ({ disruption, fetchDiversionsAction, isDiversionManagerOpen, diversionResultState, clearDiversionsCacheAction }) => {
    const { anchorEl, setAnchorEl } = useDiversionsLogic(disruption, fetchDiversionsAction, isDiversionManagerOpen, diversionResultState, clearDiversionsCacheAction);

    return (
        <div>
            <div data-testid="anchorEl">{anchorEl ? 'hasAnchor' : 'noAnchor'}</div>
            <button type="button" data-testid="setAnchor" onClick={ () => setAnchorEl(document.createElement('div')) }>Set Anchor</button>
        </div>
    );
};

TestComponent.propTypes = {
    disruption: PropTypes.object,
    fetchDiversionsAction: PropTypes.func,
    isDiversionManagerOpen: PropTypes.bool,
    diversionResultState: PropTypes.object,
    clearDiversionsCacheAction: PropTypes.func,
};

TestComponent.defaultProps = {
    disruption: null,
    fetchDiversionsAction: null,
    isDiversionManagerOpen: false,
    diversionResultState: null,
    clearDiversionsCacheAction: null,
};

describe('useDiversionsLogic', () => {
    let mockFetchDiversionsAction;
    let mockClearDiversionsCacheAction;

    beforeEach(() => {
        mockFetchDiversionsAction = jest.fn();
        mockClearDiversionsCacheAction = jest.fn();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.useFakeTimers();
    });

    describe('anchorEl state management', () => {
        it('should initialize anchorEl as null', () => {
            const wrapper = mount(
                <TestComponent
                    disruption={ null }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            expect(wrapper.find('[data-testid="anchorEl"]').text()).toBe('noAnchor');
        });

        it('should update anchorEl when setAnchorEl is called', () => {
            const wrapper = mount(
                <TestComponent
                    disruption={ null }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            act(() => {
                wrapper.find('[data-testid="setAnchor"]').simulate('click');
            });

            expect(wrapper.find('[data-testid="anchorEl"]').text()).toBe('hasAnchor');
        });
    });

    describe('disruption change effect', () => {
        it('should call fetchDiversionsAction when disruption has disruptionId', () => {
            const disruption = { disruptionId: 'DISR123' };
            mount(
                <TestComponent
                    disruption={ disruption }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            expect(mockFetchDiversionsAction).toHaveBeenCalledWith('DISR123');
        });

        it('should not call fetchDiversionsAction when disruption has no disruptionId', () => {
            const disruption = { id: 'DISR123' };
            mount(
                <TestComponent
                    disruption={ disruption }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            expect(mockFetchDiversionsAction).not.toHaveBeenCalled();
        });
    });

    describe('isDiversionManagerOpen effect', () => {
        it('should close anchorEl when isDiversionManagerOpen becomes true', () => {
            const wrapper = mount(
                <TestComponent
                    disruption={ null }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            act(() => {
                wrapper.find('[data-testid="setAnchor"]').simulate('click');
            });

            expect(wrapper.find('[data-testid="anchorEl"]').text()).toBe('hasAnchor');

            wrapper.setProps({ isDiversionManagerOpen: true });

            expect(wrapper.find('[data-testid="anchorEl"]').text()).toBe('noAnchor');
        });
    });
});
