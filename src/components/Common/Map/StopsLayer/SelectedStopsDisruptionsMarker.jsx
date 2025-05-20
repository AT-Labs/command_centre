import PropTypes from 'prop-types';
import React from 'react';
import { Popup, Tooltip } from 'react-leaflet';
import { uniqBy } from 'lodash-es';
import IconMarker from '../../IconMarker/IconMarker';
import EntityPopupWithDisruptions from '../popup/EntityPopupContent';

export class SelectedStopsDisruptionsMarker extends React.PureComponent {
    static propTypes = {
        stops: PropTypes.array.isRequired,
        size: PropTypes.number.isRequired,
        popup: PropTypes.bool,
        tooltip: PropTypes.bool,
        maximumStopsToDisplay: PropTypes.number,
        tabIndexOverride: PropTypes.number,
        checkedStopsDisruptions: PropTypes.array,
        goToDisruptionSummary: PropTypes.func,
        onPopupOpen: PropTypes.func,
        onPopupClose: PropTypes.func,
        impacts: PropTypes.array,
        causes: PropTypes.array,
    };

    static defaultProps = {
        onPopupOpen: undefined,
        onPopupClose: undefined,
        popup: false,
        tooltip: false,
        maximumStopsToDisplay: 0,
        tabIndexOverride: 0,
        checkedStopsDisruptions: [],
        goToDisruptionSummary: () => {},
        impacts: [],
        causes: [],
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
            if (!stop.stop_lat) return null;
            return (
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
                    { this.props.tooltip && (
                        <Tooltip>
                            {`${stop.stop_code} - ${stop.stop_name}`}
                        </Tooltip>
                    ) }
                    { this.props.popup && (
                        <Popup
                            direction="top"
                            offset={ [0, -50] }
                            maxWidth={ 520 }
                            minWidth={ 400 }
                            closeButton={ false }
                        >
                            <EntityPopupWithDisruptions
                                entity={ stop }
                                disruptions={ this.props.checkedStopsDisruptions.find(item => item.stopCode === stop.stop_code)?.disruptions || [] }
                                causes={ this.props.causes }
                                impacts={ this.props.impacts }
                                goToDisruptionSummary={ this.props.goToDisruptionSummary }
                            />
                        </Popup>
                    )}
                </IconMarker>
            );
        });
    }
}

export default SelectedStopsDisruptionsMarker;
