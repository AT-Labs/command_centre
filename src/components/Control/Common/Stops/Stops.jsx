import React from 'react';
import { get, inRange, size, findKey, isEmpty, isEqual, delay, sortBy, isFunction, findLastIndex } from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Stop from './Stop';
import { getStopKey } from '../../../../utils/helpers';
import { TripInstanceType, StopStatus } from '../../RoutesView/Types';
import StopSelectionFooter from '../../RoutesView/bulkSelection/StopSelectionFooter';
import { getSelectedStopsByTripKey } from '../../../../redux/selectors/control/routes/trip-instances';
import { deselectAllStopsByTrip, updateSelectedStopsByTrip } from '../../../../redux/actions/control/routes/trip-instances';
import StopLinesHelperClass from './StopLinesHelperClass';
import { useHeadsignUpdate } from '../../../../redux/selectors/appSettings';

import './Stops.scss';
import './StopsLine.scss';

const STOP_WIDTH = 146;

export class Stops extends React.Component {
    static propTypes = {
        tripInstance: TripInstanceType.isRequired,
        selectedStopsByTripKey: PropTypes.func.isRequired,
        deselectAllStopsByTrip: PropTypes.func.isRequired,
        updateSelectedStopsByTrip: PropTypes.func.isRequired,
        useHeadsignUpdate: PropTypes.bool.isRequired,
        showActuals: PropTypes.bool,
        hideFooter: PropTypes.bool,
        stopUpdatedHandler: PropTypes.func,
    };

    static defaultProps = {
        showActuals: true,
        hideFooter: false,
        stopUpdatedHandler: undefined,
    };

    constructor(props) {
        super(props);

        this.state = {
            hoveredStop: null,
            hasScrollbar: false,
        };

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        delay(() => {
            const container = this.containerRef.current;
            if (container) {
                const midContainer = parseInt(container.clientWidth / 2, 10) || 0;

                let scrollPosition = (this.getCurrentStopIndex() * STOP_WIDTH) - midContainer + STOP_WIDTH / 2;
                if (scrollPosition < 0) { scrollPosition = 0; }

                if (isFunction(container.scrollTo)) { // safe check for cypress as scrollTo does not work in Electron browser
                    container.scrollTo(scrollPosition, 0);
                }

                this.setState({
                    hasScrollbar: container.clientWidth < container.scrollWidth,
                });
            }
        }, 0);
    }

    componentDidUpdate(prevProps) {
        const { tripInstance } = this.props;

        if (prevProps.tripInstance.status !== tripInstance.status) {
            this.props.deselectAllStopsByTrip(tripInstance);
        } else if (!isEqual(prevProps.tripInstance.stops, tripInstance.stops)) {
            this.props.updateSelectedStopsByTrip(tripInstance);
        }
    }

    getSortedStops = () => sortBy(get(this.props.tripInstance, 'stops'), 'stopSequence');

    getCurrentStopIndex = () => findLastIndex(this.getSortedStops(), { status: StopStatus.passed });

    isStopInSelectionRange = (stop) => {
        const { tripInstance } = this.props;
        const selectedStops = this.props.selectedStopsByTripKey(tripInstance);

        if (!isEmpty(selectedStops)) {
            const hoveredStopData = this.state.hoveredStop && this.state.hoveredStop.stop;
            const shouldCheckRange = size(selectedStops) === 1 && hoveredStopData;
            const onlySelectedStop = selectedStops[findKey(selectedStops)];
            const isStopInRange = shouldCheckRange
            && (
                stop.stopSequence === hoveredStopData.stopSequence
                || stop.stopSequence === onlySelectedStop.stopSequence
                || inRange(
                    stop.stopSequence,
                    onlySelectedStop.stopSequence,
                    hoveredStopData.stopSequence,
                )
            );

            return isStopInRange;
        }

        return null;
    };

    render() {
        const stops = this.getSortedStops();

        if (!stops || !stops.length) return null;

        const shouldStopSelectionFooterBeShown = !this.props.hideFooter && !isEmpty(this.props.selectedStopsByTripKey(this.props.tripInstance));
        const stopContainerWidth = STOP_WIDTH * stops.length;
        const currentStop = stops[this.getCurrentStopIndex()];
        const StopLinesHelper = new StopLinesHelperClass(
            this.state.hoveredStop,
            this.props.tripInstance,
            this.props.selectedStopsByTripKey(this.props.tripInstance),
        );

        return (
            <section className={ `pt-3 ${StopLinesHelper.getHoverDirectionClass()}` }>
                <div className="d-flex">
                    <div className={ `align-self-end ml-3 mr-2 text-right ${this.state.hasScrollbar ? 'stop-times-label__scrollbar' : 'stop-times-label__no-scrollbar'}` }>
                        { this.props.useHeadsignUpdate && (
                            <div className="mb-5">
                                Destination
                            </div>
                        ) }
                        <div>Scheduled</div>
                        { this.props.showActuals && (
                            <div>
                                <span className="text-muted">Actual</span>
                                /
                                <span className="text-prediction">Prediction</span>
                            </div>
                        ) }
                    </div>
                    <div className="overflow-x-auto" ref={ this.containerRef }>
                        <div className="stop-control-container d-flex" style={ { width: `${stopContainerWidth}px` } }>
                            { stops.map((stop) => {
                                const { selectedEventClasses, hoverEventClasses } = StopLinesHelper.getLineInteractionClasses(stop);
                                return (
                                    <Stop
                                        stop={ stop }
                                        key={ getStopKey(stop) }
                                        tripInstance={ this.props.tripInstance }
                                        onHover={ hoveredStop => this.setState({ hoveredStop }) }
                                        isStopInSelectionRange={ this.isStopInSelectionRange(stop) }
                                        isCurrent={ stop.stopSequence === get(currentStop, 'stopSequence') }
                                        lineInteractionClasses={ `${selectedEventClasses} ${hoverEventClasses}` }
                                        showActuals={ this.props.showActuals }
                                        stopUpdatedHandler={ this.props.stopUpdatedHandler } />
                                );
                            })}
                        </div>
                    </div>
                </div>
                { shouldStopSelectionFooterBeShown && <StopSelectionFooter tripInstance={ this.props.tripInstance } stopUpdatedHandler={ this.props.stopUpdatedHandler } /> }
            </section>
        );
    }
}

export default connect(state => ({
    selectedStopsByTripKey: tripInstance => getSelectedStopsByTripKey(state.control.routes.tripInstances.selectedStops, tripInstance),
    useHeadsignUpdate: useHeadsignUpdate(state),
}), { deselectAllStopsByTrip, updateSelectedStopsByTrip })(Stops);
