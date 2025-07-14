import { getColor } from './traffic';
import {
    CONGESTION_THRESHOLD_BLUE,
    CONGESTION_THRESHOLD_GREEN,
    CONGESTION_THRESHOLD_DARK_ORANGE,
    CONGESTION_THRESHOLD_MAROON,
    CONGESTION_THRESHOLD_BLACK,
    CONGESTION_COLORS,
} from '../constants/traffic';

describe('traffic utils', () => {
    describe('getColor', () => {
        it('should return BLUE for relativeSpeed >= CONGESTION_THRESHOLD_BLUE', () => {
            expect(getColor(0.9)).toBe(CONGESTION_COLORS.BLUE);
            expect(getColor(0.95)).toBe(CONGESTION_COLORS.BLUE);
            expect(getColor(1.0)).toBe(CONGESTION_COLORS.BLUE);
        });

        it('should return BLUE for null, undefined, or falsy relativeSpeed values', () => {
            expect(getColor(null)).toBe(CONGESTION_COLORS.BLUE);
            expect(getColor(undefined)).toBe(CONGESTION_COLORS.BLUE);
            expect(getColor(0)).toBe(CONGESTION_COLORS.BLUE);
            expect(getColor('')).toBe(CONGESTION_COLORS.BLUE);
            expect(getColor(false)).toBe(CONGESTION_COLORS.BLUE);
        });

        it('should return GREEN for relativeSpeed >= CONGESTION_THRESHOLD_GREEN and < CONGESTION_THRESHOLD_BLUE', () => {
            expect(getColor(0.7)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(0.8)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(0.89)).toBe(CONGESTION_COLORS.GREEN);
        });

        it('should return DARK_ORANGE for relativeSpeed >= CONGESTION_THRESHOLD_DARK_ORANGE and < CONGESTION_THRESHOLD_GREEN', () => {
            expect(getColor(0.5)).toBe(CONGESTION_COLORS.DARK_ORANGE);
            expect(getColor(0.6)).toBe(CONGESTION_COLORS.DARK_ORANGE);
            expect(getColor(0.69)).toBe(CONGESTION_COLORS.DARK_ORANGE);
        });

        it('should return MAROON for relativeSpeed >= CONGESTION_THRESHOLD_MAROON and < CONGESTION_THRESHOLD_DARK_ORANGE', () => {
            expect(getColor(0.4)).toBe(CONGESTION_COLORS.MAROON);
            expect(getColor(0.45)).toBe(CONGESTION_COLORS.MAROON);
            expect(getColor(0.49)).toBe(CONGESTION_COLORS.MAROON);
        });

        it('should return BLACK for relativeSpeed >= CONGESTION_THRESHOLD_BLACK and < CONGESTION_THRESHOLD_MAROON', () => {
            expect(getColor(0.3)).toBe(CONGESTION_COLORS.BLACK);
            expect(getColor(0.35)).toBe(CONGESTION_COLORS.BLACK);
            expect(getColor(0.39)).toBe(CONGESTION_COLORS.BLACK);
        });

        it('should return BLUE as default for relativeSpeed < CONGESTION_THRESHOLD_BLACK', () => {
            expect(getColor(0.1)).toBe(CONGESTION_COLORS.BLUE);
            expect(getColor(0.2)).toBe(CONGESTION_COLORS.BLUE);
            expect(getColor(0.29)).toBe(CONGESTION_COLORS.BLUE);
        });

        it('should handle edge cases at threshold boundaries', () => {
            expect(getColor(CONGESTION_THRESHOLD_BLUE)).toBe(CONGESTION_COLORS.BLUE);
            expect(getColor(CONGESTION_THRESHOLD_GREEN)).toBe(CONGESTION_COLORS.GREEN);
            expect(getColor(CONGESTION_THRESHOLD_DARK_ORANGE)).toBe(CONGESTION_COLORS.DARK_ORANGE);
            expect(getColor(CONGESTION_THRESHOLD_MAROON)).toBe(CONGESTION_COLORS.MAROON);
            expect(getColor(CONGESTION_THRESHOLD_BLACK)).toBe(CONGESTION_COLORS.BLACK);
        });
    });
});
