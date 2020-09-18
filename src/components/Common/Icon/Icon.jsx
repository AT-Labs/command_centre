/* eslint-disable global-require, react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ icon, ...props }) => {
    try {
        const svg = require(`!raw-loader!../../../assets/img/${icon.toLowerCase()}.svg`);
        return <i { ...props } dangerouslySetInnerHTML={ { __html: svg } } />;
    } catch (e) { /**/ }
    return null;
};

Icon.propTypes = {
    icon: PropTypes.string.isRequired,
};

export default Icon;
