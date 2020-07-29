import React from 'react';
import PropTypes from 'prop-types';
import Loader from './Loader';
import './DetailLoader.scss';

const DetailLoader = props => (
    <div className={ `detail-view-loader ${props.centered ? 'mx-auto' : ''}` }>
        <Loader ariaLabel="Loading data" />
    </div>
);

DetailLoader.propTypes = {
    centered: PropTypes.bool,
};

DetailLoader.defaultProps = {
    centered: false,
};

export default DetailLoader;
