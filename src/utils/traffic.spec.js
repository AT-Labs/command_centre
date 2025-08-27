import { getColor } from './traffic';
import {
    CONGESTION_THRESHOLD_RED,
    CONGESTION_THRESHOLD_MAROON,
    CONGESTION_THRESHOLD_YELLOW,
    CONGESTION_THRESHOLD_ORANGE,
    CONGESTION_THRESHOLD_GREEN,
    CONGESTION_COLORS,
} from '../constants/traffic';

describe('traffic utils', () => {
    describe('getColor', () => {
        it('should return GREEN for relativeSpeed >= CONGESTION_THRESHOLD_GREEN', () => {
            expect(getColor(0.9)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(0.95)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(1.0)).toBe(CONGESTION_COLORS.GREEN);
        });

        it('should return GREEN for null, undefined, or falsy relativeSpeed values', () => {
            expect(getColor(null)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(undefined)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(0)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor('')).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(false)).toBe(CONGESTION_COLORS.GREEN);
        });

        it('should return YELLOW for relativeSpeed >= CONGESTION_THRESHOLD_YELLOW and < CONGESTION_THRESHOLD_GREEN', () => {
            expect(getColor(0.7)).toBe(CONGESTION_COLORS.YELLOW);
            expect(getColor(0.8)).toBe(CONGESTION_COLORS.YELLOW);
            expect(getColor(0.89)).toBe(CONGESTION_COLORS.YELLOW);
        });

        it('should return ORANGE for relativeSpeed >= CONGESTION_THRESHOLD_ORANGE and < CONGESTION_THRESHOLD_YELLOW', () => {
            expect(getColor(0.5)).toBe(CONGESTION_COLORS.ORANGE);
            expect(getColor(0.6)).toBe(CONGESTION_COLORS.ORANGE);
            expect(getColor(0.69)).toBe(CONGESTION_COLORS.ORANGE);
        });

        it('should return RED for relativeSpeed >= CONGESTION_THRESHOLD_RED and < CONGESTION_THRESHOLD_ORANGE', () => {
            expect(getColor(0.4)).toBe(CONGESTION_COLORS.RED);
            expect(getColor(0.45)).toBe(CONGESTION_COLORS.RED);
            expect(getColor(0.49)).toBe(CONGESTION_COLORS.RED);
        });

        it('should return MAROON for relativeSpeed >= CONGESTION_THRESHOLD_MAROON and < CONGESTION_THRESHOLD_RED', () => {
            expect(getColor(0.3)).toBe(CONGESTION_COLORS.MAROON);
            expect(getColor(0.35)).toBe(CONGESTION_COLORS.MAROON);
            expect(getColor(0.39)).toBe(CONGESTION_COLORS.MAROON);
        });

        it('should return GREEN as default for relativeSpeed < CONGESTION_THRESHOLD_MAROON', () => {
            expect(getColor(0.1)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(0.2)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(0.29)).toBe(CONGESTION_COLORS.GREEN);
        });

        it('should handle edge cases at threshold boundaries', () => {
            expect(getColor(CONGESTION_THRESHOLD_GREEN)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(CONGESTION_THRESHOLD_YELLOW)).toBe(CONGESTION_COLORS.YELLOW);
            expect(getColor(CONGESTION_THRESHOLD_ORANGE)).toBe(CONGESTION_COLORS.ORANGE);
            expect(getColor(CONGESTION_THRESHOLD_RED)).toBe(CONGESTION_COLORS.RED);
            expect(getColor(CONGESTION_THRESHOLD_MAROON)).toBe(CONGESTION_COLORS.MAROON);
        });
    });
});
