/* eslint-disable global-require, react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ icon, ...props }) => {
    const svg = require(`!raw-loader!../../../assets/img/${icon.toLowerCase()}.svg`);
    return <i { ...props } dangerouslySetInnerHTML={ { __html: svg } } />;
};

Icon.propTypes = {
    icon: PropTypes.string.isRequired,
};

export default Icon;
