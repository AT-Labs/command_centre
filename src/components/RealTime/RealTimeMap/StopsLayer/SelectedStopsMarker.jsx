import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getCheckedStops } from '../../../../redux/selectors/realtime/detail';
import { updateHoveredEntityKey } from '../../../../redux/actions/realtime/map';
import IconMarker from '../../../Common/IconMarker/IconMarker';
import EntityPopup from '../popup/EntityPopup';

class SelectedStopsMarker extends React.PureComponent {
    static propTypes = {
        stops: PropTypes.array.isRequired,
        updateHoveredEntityKey: PropTypes.func.isRequired,
    };

    handleClick = (event) => {
        event.target.openPopup(event.latlng);
    };

    handlePopupOpen = (entity) => {
        this.props.updateHoveredEntityKey(entity.key);
    };

    handlePopupClose = () => {
        this.props.updateHoveredEntityKey('');
    };

    render() {
        const { stops } = this.props;
        return stops.map((stop) => {
            const marker = stop.stop_lat
                ? (
                    <IconMarker
                        key={ stop.stop_id }
                        className="selected-stop-marker"
                        location={ [stop.stop_lat, stop.stop_lon] }
                        imageName="bus-stop"
                        size={ 26 }
                        onClick={ this.handleClick }
                        onPopupOpen={ () => this.handlePopupOpen(stop) }
                        onPopupClose={ this.handlePopupClose }
                    >
                        <EntityPopup entity={ stop } />
                    </IconMarker>
                )
                : null;

            return marker;
        });
    }
}

export default connect(state => ({
    stops: getCheckedStops(state),
}), { updateHoveredEntityKey })(SelectedStopsMarker);
