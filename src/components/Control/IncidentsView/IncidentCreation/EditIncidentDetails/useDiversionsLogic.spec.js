/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useDiversionsLogic } from './useDiversionsLogic';

describe('useDiversionsLogic', () => {
    it('should export useDiversionsLogic function', () => {
        expect(typeof useDiversionsLogic).toBe('function');
    });

    it('should initialize with null anchorEl', () => {
        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockIsDiversionManagerOpen = false;
        const mockDiversionResultState = null;
        const mockClearDiversionsCacheAction = jest.fn();

        const { result } = renderHook(() => useDiversionsLogic(
            mockDisruption,
            mockFetchDiversionsAction,
            mockIsDiversionManagerOpen,
            mockDiversionResultState,
            mockClearDiversionsCacheAction,
        ));

        expect(result.current.anchorEl).toBe(null);
        expect(typeof result.current.setAnchorEl).toBe('function');
    });

    it('should call fetchDiversionsAction when disruption has disruptionId', () => {
        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockIsDiversionManagerOpen = false;
        const mockDiversionResultState = null;
        const mockClearDiversionsCacheAction = jest.fn();

        renderHook(() => useDiversionsLogic(
            mockDisruption,
            mockFetchDiversionsAction,
            mockIsDiversionManagerOpen,
            mockDiversionResultState,
            mockClearDiversionsCacheAction,
        ));

        expect(mockFetchDiversionsAction).toHaveBeenCalledWith('test-id');
    });
});