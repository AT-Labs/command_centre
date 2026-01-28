export const buildHeadSignWithCustomization = (newDestination, selectedPidCustomization, isLimitedStops) => {
    let headSign = newDestination;
    if (isLimitedStops) {
        headSign += ' Limited Stops';
    }
    if (selectedPidCustomization !== 'None') {
        headSign += selectedPidCustomization.includes('/') ? `${selectedPidCustomization}` : ` ${selectedPidCustomization}`;
    }

    return headSign;
};
