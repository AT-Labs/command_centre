/**
 * @jest-environment jsdom
 */
import React from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import { useDiversionsLogic, useAffectedEntities, useDiversionValidation } from './useDiversionsLogic';

const TestComponent = ({
    disruption,
    fetchDiversionsAction,
    isDiversionManagerOpen,
    diversionResultState,
    clearDiversionsCacheAction,
    reduxAffectedRoutes,
    affectedEntities,
    diversions,
}) => {
    const diversionsLogic = useDiversionsLogic(
        disruption,
        fetchDiversionsAction,
        isDiversionManagerOpen,
        diversionResultState,
        clearDiversionsCacheAction,
    );

    const affectedEntitiesResult = useAffectedEntities(disruption, reduxAffectedRoutes);
    const diversionValidation = useDiversionValidation(disruption, affectedEntities, diversions);

    return (
        <div>
            <div data-testid="anchorEl">{diversionsLogic.anchorEl ? 'has-anchor' : 'no-anchor'}</div>
            <div data-testid="setAnchorEl">{typeof diversionsLogic.setAnchorEl}</div>
            <div data-testid="affectedEntities">{JSON.stringify(affectedEntitiesResult)}</div>
            <div data-testid="diversionValidation">{diversionValidation ? 'enabled' : 'disabled'}</div>
        </div>
    );
};

describe('useDiversionsLogic', () => {
    it('should export useDiversionsLogic function', () => {
        expect(typeof useDiversionsLogic).toBe('function');
    });

    it('should export useAffectedEntities function', () => {
        expect(typeof useAffectedEntities).toBe('function');
    });

    it('should export useDiversionValidation function', () => {
        expect(typeof useDiversionValidation).toBe('function');
    });

    it('should initialize with null anchorEl', () => {
        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockIsDiversionManagerOpen = false;
        const mockDiversionResultState = null;
        const mockClearDiversionsCacheAction = jest.fn();

        const { getByTestId } = render(
            <TestComponent
                disruption={ mockDisruption }
                fetchDiversionsAction={ mockFetchDiversionsAction }
                isDiversionManagerOpen={ mockIsDiversionManagerOpen }
                diversionResultState={ mockDiversionResultState }
                clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
            />,
        );

        expect(getByTestId('anchorEl').textContent).toBe('no-anchor');
        expect(getByTestId('setAnchorEl').textContent).toBe('function');
    });

    it('should call fetchDiversionsAction when disruption has disruptionId', () => {
        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockIsDiversionManagerOpen = false;
        const mockDiversionResultState = null;
        const mockClearDiversionsCacheAction = jest.fn();

        render(
            <TestComponent
                disruption={ mockDisruption }
                fetchDiversionsAction={ mockFetchDiversionsAction }
                isDiversionManagerOpen={ mockIsDiversionManagerOpen }
                diversionResultState={ mockDiversionResultState }
                clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
            />,
        );

        expect(mockFetchDiversionsAction).toHaveBeenCalledWith('test-id');
    });
});

describe('useAffectedEntities', () => {
    it('should return reduxAffectedRoutes when available', () => {
        const mockDisruption = { disruptionId: 'test-id' };
        const mockReduxAffectedRoutes = [{ routeId: 1, routeName: 'Route 1' }];

        const { getByTestId } = render(
            <TestComponent
                disruption={ mockDisruption }
                reduxAffectedRoutes={ mockReduxAffectedRoutes }
            />,
        );

        const result = JSON.parse(getByTestId('affectedEntities').textContent);
        expect(result).toEqual(mockReduxAffectedRoutes);
    });

    it('should return empty array when no affected entities', () => {
        const mockDisruption = { disruptionId: 'test-id' };

        const { getByTestId } = render(
            <TestComponent
                disruption={ mockDisruption }
            />,
        );

        const result = JSON.parse(getByTestId('affectedEntities').textContent);
        expect(result).toEqual([]);
    });
});

describe('useDiversionValidation', () => {
    it('should return false for resolved disruption', () => {
        const mockDisruption = { disruptionId: 'test-id', status: 'resolved' };
        const mockAffectedEntities = [{ routeId: 1, routeType: 3 }];

        const { getByTestId } = render(
            <TestComponent
                disruption={ mockDisruption }
                affectedEntities={ mockAffectedEntities }
            />,
        );

        expect(getByTestId('diversionValidation').textContent).toBe('disabled');
    });

    it('should return true for valid bus route', () => {
        const mockDisruption = { disruptionId: 'test-id', status: 'in-progress' };
        const mockAffectedEntities = [{ routeId: 1, routeType: 3 }];

        const { getByTestId } = render(
            <TestComponent
                disruption={ mockDisruption }
                affectedEntities={ mockAffectedEntities }
            />,
        );

        expect(getByTestId('diversionValidation').textContent).toBe('enabled');
    });
});

TestComponent.propTypes = {
    disruption: PropTypes.object,
    fetchDiversionsAction: PropTypes.func,
    isDiversionManagerOpen: PropTypes.bool,
    diversionResultState: PropTypes.object,
    clearDiversionsCacheAction: PropTypes.func,
    reduxAffectedRoutes: PropTypes.array,
    affectedEntities: PropTypes.array,
    diversions: PropTypes.array,
};

TestComponent.defaultProps = {
    disruption: null,
    fetchDiversionsAction: null,
    isDiversionManagerOpen: false,
    diversionResultState: null,
    clearDiversionsCacheAction: null,
    reduxAffectedRoutes: null,
    affectedEntities: null,
    diversions: null,
};
