import {
    CONGESTION_THRESHOLD_BLUE,
    CONGESTION_THRESHOLD_GREEN,
    CONGESTION_THRESHOLD_DARK_ORANGE,
    CONGESTION_THRESHOLD_MAROON,
    CONGESTION_THRESHOLD_BLACK,
    CONGESTION_COLORS,
} from '../constants/traffic';

export const getColor = (relativeSpeed) => {
    if (relativeSpeed >= CONGESTION_THRESHOLD_BLUE || !relativeSpeed) {
        return CONGESTION_COLORS.BLUE;
    }
    if (relativeSpeed >= CONGESTION_THRESHOLD_GREEN) {
        return CONGESTION_COLORS.GREEN;
    }
    if (relativeSpeed >= CONGESTION_THRESHOLD_DARK_ORANGE) {
        return CONGESTION_COLORS.DARK_ORANGE;
    }
    if (relativeSpeed >= CONGESTION_THRESHOLD_MAROON) {
        return CONGESTION_COLORS.MAROON;
    }
    if (relativeSpeed >= CONGESTION_THRESHOLD_BLACK) {
        return CONGESTION_COLORS.BLACK;
    }
    return CONGESTION_COLORS.BLUE;
};

export const applyFilters = (relativeSpeed, filters) => {
    const color = getColor(relativeSpeed);
    return filters.includes(color);
};
