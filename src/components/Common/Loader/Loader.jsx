import React from 'react';
import PropTypes from 'prop-types';

import './Loader.scss';

const Loader = ({ ariaLabel, className }) => <div className={ `loader ${className}` } aria-label={ ariaLabel } />;

Loader.propTypes = {
    ariaLabel: PropTypes.string,
    className: PropTypes.string,
};

Loader.defaultProps = {
    ariaLabel: 'Loading',
    className: '',
};

export default Loader;
