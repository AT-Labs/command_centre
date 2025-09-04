import { renderHook } from '@testing-library/react-hooks';
import { useDisruptions } from './SelectEffects';

describe('useDisruptions', () => {
    const mockDisruptions = [
        { key: 'key1', impact: 'CATASTROPHIC', severity: 'SERIOUS' },
        { key: 'key2', impact: 'MINOR', severity: 'MINOR' },
        { key: 'key3', impact: 'HEADLINE', severity: 'HEADLINE' },
    ];

    it('should create disruptions map correctly', () => {
        const { result } = renderHook(() => useDisruptions(mockDisruptions));

        expect(result.current.disruptionsMap).toEqual({
            key1: { key: 'key1', impact: 'CATASTROPHIC', severity: 'SERIOUS' },
            key2: { key: 'key2', impact: 'MINOR', severity: 'MINOR' },
            key3: { key: 'key3', impact: 'HEADLINE', severity: 'HEADLINE' },
        });
    });

    it('should return getDisruptionByKey function', () => {
        const { result } = renderHook(() => useDisruptions(mockDisruptions));

        expect(typeof result.current.getDisruptionByKey).toBe('function');
    });

    it('should return correct disruption by key', () => {
        const { result } = renderHook(() => useDisruptions(mockDisruptions));

        const disruption1 = result.current.getDisruptionByKey('key1');
        const disruption2 = result.current.getDisruptionByKey('key2');

        expect(disruption1).toEqual({ key: 'key1', impact: 'CATASTROPHIC', severity: 'SERIOUS' });
        expect(disruption2).toEqual({ key: 'key2', impact: 'MINOR', severity: 'MINOR' });
    });

    it('should return undefined for non-existent key', () => {
        const { result } = renderHook(() => useDisruptions(mockDisruptions));

        const nonExistentDisruption = result.current.getDisruptionByKey('non-existent');

        expect(nonExistentDisruption).toBeUndefined();
    });

    it('should return disruptions array', () => {
        const { result } = renderHook(() => useDisruptions(mockDisruptions));

        expect(result.current.disruptions).toEqual(mockDisruptions);
    });

    it('should handle empty disruptions array', () => {
        const { result } = renderHook(() => useDisruptions([]));

        expect(result.current.disruptionsMap).toEqual({});
        expect(result.current.disruptions).toEqual([]);
        expect(result.current.getDisruptionByKey('any-key')).toBeUndefined();
    });

    it('should handle null disruptions', () => {
        const { result } = renderHook(() => useDisruptions(null));

        expect(result.current.disruptionsMap).toEqual({});
        expect(result.current.disruptions).toBeNull();
        expect(result.current.getDisruptionByKey('any-key')).toBeUndefined();
    });

    it('should handle undefined disruptions', () => {
        const { result } = renderHook(() => useDisruptions(undefined));

        expect(result.current.disruptionsMap).toEqual({});
        expect(result.current.disruptions).toBeUndefined();
        expect(result.current.getDisruptionByKey('any-key')).toBeUndefined();
    });

    it('should memoize disruptions map', () => {
        const { result, rerender } = renderHook(() => useDisruptions(mockDisruptions));

        const firstMap = result.current.disruptionsMap;
        const firstGetDisruptionByKey = result.current.getDisruptionByKey;

        rerender();

        const secondMap = result.current.disruptionsMap;
        const secondGetDisruptionByKey = result.current.getDisruptionByKey;

        expect(firstMap).toBe(secondMap);
        expect(firstGetDisruptionByKey).toBe(secondGetDisruptionByKey);
    });

    it('should update disruptions map when disruptions change', () => {
        const { result, rerender } = renderHook(
            ({ disruptions }) => useDisruptions(disruptions),
            { initialProps: { disruptions: mockDisruptions } },
        );

        const firstMap = result.current.disruptionsMap;

        const newDisruptions = [
            { key: 'new-key', impact: 'NEW_IMPACT' },
        ];

        rerender({ disruptions: newDisruptions });

        const secondMap = result.current.disruptionsMap;

        expect(firstMap).not.toBe(secondMap);
        expect(secondMap).toEqual({
            'new-key': { key: 'new-key', impact: 'NEW_IMPACT' },
        });
    });
});
