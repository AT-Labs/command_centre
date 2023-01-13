import PropTypes from 'prop-types';
import React from 'react';
import { Tooltip } from 'react-leaflet';
import { uniqBy } from 'lodash-es';
import IconMarker from '../../IconMarker/IconMarker';
import EntityPopup from '../popup/EntityPopup';

export class SelectedStopsMarker extends React.PureComponent {
    static propTypes = {
        stops: PropTypes.array.isRequired,
        onPopupOpen: PropTypes.func,
        onPopupClose: PropTypes.func,
        size: PropTypes.number.isRequired,
        popup: PropTypes.bool,
        tooltip: PropTypes.bool,
        maximumStopsToDisplay: PropTypes.number,
        tabIndexOverride: PropTypes.number,
    };

    static defaultProps = {
        onPopupOpen: undefined,
        onPopupClose: undefined,
        popup: false,
        tooltip: false,
        maximumStopsToDisplay: 0,
        tabIndexOverride: 0,
    };

    handleClick = (event) => {
        if (this.props.popup) {
            event.target.openPopup(event.latlng);
        }
    };

    getStopsToDisplay = () => {
        let stopsToDisplay = uniqBy(this.props.stops, stop => stop.stop_code);
        if (this.props.maximumStopsToDisplay > 0) {
            stopsToDisplay = stopsToDisplay.slice(0, this.props.maximumStopsToDisplay);
        }
        return stopsToDisplay;
    };

    render() {
        return this.getStopsToDisplay().map((stop) => {
            const marker = stop.stop_lat
                ? (
                    <IconMarker
                        keyboard={ this.props.tabIndexOverride >= 0 }
                        key={ stop.stop_id }
                        className="selected-stop-marker"
                        location={ [stop.stop_lat, stop.stop_lon] }
                        imageName="bus-stop"
                        size={ this.props.size }
                        onClick={ this.handleClick }
                        onPopupOpen={ this.props.onPopupOpen ? () => this.props.onPopupOpen(stop) : undefined }
                        onPopupClose={ this.props.onPopupClose ? this.props.onPopupClose : undefined }
                    >
                        { this.props.popup && (
                            <EntityPopup entity={ stop } />
                        ) }
                        { this.props.tooltip && (
                            <Tooltip>
                                {`${stop.stop_code} - ${stop.stop_name}`}
                            </Tooltip>
                        ) }
                    </IconMarker>
                )
                : null;

            return marker;
        });
    }
}
