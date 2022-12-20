import PropTypes from 'prop-types';
import React from 'react';
import IconMarker from '../../IconMarker/IconMarker';

export class SelectedAddressMarker extends React.PureComponent {
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

SelectedAddressMarker.propTypes = {
    address: PropTypes.object,
};

SelectedAddressMarker.defaultProps = {
    address: {},
};
