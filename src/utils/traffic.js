import {
    CONGESTION_THRESHOLD_RED,
    CONGESTION_THRESHOLD_MAROON,
    CONGESTION_THRESHOLD_YELLOW,
    CONGESTION_THRESHOLD_ORANGE,
    CONGESTION_THRESHOLD_GREEN,
    CONGESTION_COLORS,
} from '../constants/traffic';

export const getColor = (relativeSpeed) => {
    if (relativeSpeed >= CONGESTION_THRESHOLD_GREEN || !relativeSpeed) {
        return CONGESTION_COLORS.GREEN;
    }
    if (relativeSpeed >= CONGESTION_THRESHOLD_YELLOW) {
        return CONGESTION_COLORS.YELLOW;
    }
    if (relativeSpeed >= CONGESTION_THRESHOLD_ORANGE) {
        return CONGESTION_COLORS.ORANGE;
    }
    if (relativeSpeed >= CONGESTION_THRESHOLD_RED) {
        return CONGESTION_COLORS.RED;
    }
    if (relativeSpeed >= CONGESTION_THRESHOLD_MAROON) {
        return CONGESTION_COLORS.MAROON;
    }
    return CONGESTION_COLORS.GREEN;
};

export const applyFilters = (relativeSpeed, filters) => {
    const color = getColor(relativeSpeed);
    return filters.includes(color);
};
