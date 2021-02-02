import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Stop from './Stop';
import { getStopKey } from '../../../../utils/helpers';
import { TripInstanceType, StopStatus } from '../../RoutesView/Types';
import StopSelectionFooter from '../../RoutesView/bulkSelection/StopSelectionFooter';
import { getSelectedStopsByTripKey } from '../../../../redux/selectors/control/routes/trip-instances';
import { deselectAllStopsByTrip, updateSelectedStopsByTrip } from '../../../../redux/actions/control/routes/trip-instances';
import StopLinesHelperClass from './StopLinesHelperClass';

import './Stops.scss';
import './StopsLine.scss';

const STOP_WIDTH = 146;

export class Stops extends React.Component {
    static propTypes = {
        tripInstance: TripInstanceType.isRequired,
        selectedStopsByTripKey: PropTypes.func.isRequired,
        deselectAllStopsByTrip: PropTypes.func.isRequired,
        updateSelectedStopsByTrip: PropTypes.func.isRequired,
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
        _.delay(() => {
            const container = this.containerRef.current;
            if (container) {
                const midContainer = parseInt(container.clientWidth / 2, 10) || 0;

                let scrollPosition = (this.getCurrentStopIndex() * STOP_WIDTH) - midContainer + STOP_WIDTH / 2;
                if (scrollPosition < 0) { scrollPosition = 0; }

                if (_.isFunction(container.scrollTo)) { // safe check for cypress as scrollTo does not work in Electron browser
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
        } else if (!_.isEqual(prevProps.tripInstance.stops, tripInstance.stops)) {
            this.props.updateSelectedStopsByTrip(tripInstance);
        }
    }

    getSortedStops = () => _.sortBy(_.get(this.props.tripInstance, 'stops'), 'stopSequence');

    getCurrentStopIndex = () => _.findLastIndex(this.getSortedStops(), { status: StopStatus.passed });

    isStopInSelectionRange = (stop) => {
        const { tripInstance } = this.props;
        const selectedStops = this.props.selectedStopsByTripKey(tripInstance);

        if (!_.isEmpty(selectedStops)) {
            const hoveredStopData = this.state.hoveredStop && this.state.hoveredStop.stop;
            const shouldCheckRange = _.size(selectedStops) === 1 && hoveredStopData;
            const onlySelectedStop = selectedStops[_.findKey(selectedStops)];
            const isStopInRange = shouldCheckRange
            && (
                stop.stopSequence === hoveredStopData.stopSequence
                || stop.stopSequence === onlySelectedStop.stopSequence
                || _.inRange(
                    stop.stopSequence,
                    onlySelectedStop.stopSequence,
                    hoveredStopData.stopSequence,
                )
            );

            return isStopInRange;
        }

        return null;
    }

    render() {
        const stops = this.getSortedStops();

        if (!stops || !stops.length) return null;

        const shouldStopSelectionFooterBeShown = !_.isEmpty(this.props.selectedStopsByTripKey(this.props.tripInstance));
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
                        <div>Scheduled</div>
                        <div>
                            <span className="text-muted">Actual</span>/<span className="text-prediction">Prediction</span>
                        </div>
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
                                        isCurrent={ stop.stopSequence === _.get(currentStop, 'stopSequence') }
                                        lineInteractionClasses={ `${selectedEventClasses} ${hoverEventClasses}` } />
                                );
                            })}
                        </div>
                    </div>
                </div>
                { shouldStopSelectionFooterBeShown && <StopSelectionFooter tripInstance={ this.props.tripInstance } /> }
            </section>
        );
    }
}

export default connect(state => ({
    selectedStopsByTripKey: tripInstance => getSelectedStopsByTripKey(state.control.routes.tripInstances.selectedStops, tripInstance),
}), { deselectAllStopsByTrip, updateSelectedStopsByTrip })(Stops);
