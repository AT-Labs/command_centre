import { isEmpty, findKey, size } from 'lodash-es';
import { getStopKey } from '../../../../utils/helpers';

export default class StopLinesHelperClass {
    constructor(hoveredStop, tripInstance, selectedStops) {
        this.hoveredStop = hoveredStop;
        this.tripInstance = tripInstance;
        this.selectedStops = selectedStops;
    }

    getCommonValuesForLineInteractions = () => ({
        // These method returns values used by both getHoverDirectionClass() & getLineInteractionClasses() to avoid code duplication.
        isHoveredStopSetSet: !isEmpty(this.hoveredStop),
        isSelectedStopsEmpty: isEmpty(this.selectedStops),
        selectedStop: this.selectedStops && this.selectedStops[findKey(this.selectedStops)],
    });

    getHoverDirectionClass() {
        // This method generates the necessary classes to the parent as for the children to be aware of the direction they should point to.
        // if hover is on a stop previous to the selected stop, that will add stop-control--hover-direction-prev and vice versa.
        let prevOrNext = '';
        const { isHoveredStopSetSet, isSelectedStopsEmpty, selectedStop } = this.getCommonValuesForLineInteractions();
        const isOnlyOneStopSelected = size(this.selectedStops) === 1;

        if (!isSelectedStopsEmpty && isOnlyOneStopSelected && isHoveredStopSetSet) {
            if (selectedStop.stopSequence < this.hoveredStop.stop.stopSequence) prevOrNext = 'stop-control--hover-direction-next';
            else if (selectedStop.stopSequence > this.hoveredStop.stop.stopSequence) prevOrNext = 'stop-control--hover-direction-prev';
        }

        return prevOrNext;
    }

    getLineInteractionClasses(stop) {
        // This method generates the classes for the selected and hovered stops and the ones around them.
        // after you select a stop and hover on another one, the stops before and after them as well as the first and last in the list will be applied these classes accordingly.
        // This approach was selected to avoid modifying the existing "line" implementation.
        const { isHoveredStopSetSet, isSelectedStopsEmpty, selectedStop } = this.getCommonValuesForLineInteractions();
        const isStopSelected = this.selectedStops && !isEmpty(this.selectedStops[getStopKey(stop)]);

        let hoverEventClasses = '';
        let selectedEventClasses = '';

        if (!isSelectedStopsEmpty) {
            const isStopPrevOfSelected = stop.stopSequence === selectedStop.stopSequence - 1;
            const isStopNextOfSelected = stop.stopSequence === selectedStop.stopSequence + 1;

            const selectedStopClass = isStopSelected ? 'stop-control--selected-stop' : '';
            const prevOfSelectedStopClass = isStopPrevOfSelected ? 'stop-control--prev-of-selected-stop' : '';
            const nextOfSelectedStopClass = isStopNextOfSelected ? 'stop-control--next-of-selected-stop' : '';

            selectedEventClasses = `
                ${selectedStopClass} 
                ${prevOfSelectedStopClass} 
                ${nextOfSelectedStopClass}`.replace(/\s+/g, ' ').trim(); // remove extra spaces

            if (isHoveredStopSetSet) {
                const isStopPrevOfHovered = stop.stopSequence === this.hoveredStop.stop.stopSequence - 1;
                const isStopNextOfHovered = stop.stopSequence === this.hoveredStop.stop.stopSequence + 1;

                const prevOfHoveredStopClass = isStopPrevOfHovered ? 'stop-control--prev-of-hovered-stop' : '';
                const nextOfHoveredStopClass = isStopNextOfHovered ? 'stop-control--next-of-selected-stop' : '';
                const firstStopClassWhenHoverEvent = stop.stopSequence === 1 ? 'stop-control--first-stop' : '';
                const hoveredStopClass = stop.stopSequence === this.hoveredStop.stop.stopSequence ? 'stop-control--hovered-stop' : '';
                const lastStopClassWhenHoverEvent = stop.stopSequence === size(this.tripInstance.stops) ? 'stop-control--last-stop' : '';
                const hoveredSelectedStop = this.hoveredStop.stop.stopSequence === selectedStop.stopSequence ? 'stop-control--hovered-selected-stop' : '';

                hoverEventClasses = `
                    ${hoveredStopClass} 
                    ${hoveredSelectedStop} 
                    ${prevOfHoveredStopClass} 
                    ${nextOfHoveredStopClass} 
                    ${lastStopClassWhenHoverEvent} 
                    ${firstStopClassWhenHoverEvent}`.replace(/\s+/g, ' ').trim(); // remove extra spaces
            }
        }

        return {
            selectedEventClasses,
            hoverEventClasses,
        };
    }
}
