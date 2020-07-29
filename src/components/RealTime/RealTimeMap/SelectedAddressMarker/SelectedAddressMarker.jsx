import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getAddressDetail } from '../../../../redux/selectors/realtime/detail';
import IconMarker from '../../../Common/IconMarker/IconMarker';

class SelectedAddressMarker extends React.PureComponent {
    static propTypes = {
        address: PropTypes.object.isRequired,
    };

    render() {
        const { address } = this.props;
        const marker = this.props.address.lat
            ? (
                <IconMarker
                    className="cc-address-marker selected-address-marker"
                    location={ [address.lat, address.lng] }
                    imageName="address"
                    size={ 45 } />
            )
            : null;

        return marker;
    }
}

export default connect(state => ({
    address: getAddressDetail(state),
}))(SelectedAddressMarker);
