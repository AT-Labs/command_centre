import React, { useMemo } from 'react';
import { IconContext } from 'react-icons';
import PropTypes from 'prop-types';

const IconProvider = ({ children, contextValue }) => {
    const iconContextValue = useMemo(() => (contextValue), []);
    return (
        <IconContext.Provider value={ iconContextValue }>
            {children}
        </IconContext.Provider>
    );
};

IconProvider.propTypes = {
    children: PropTypes.element.isRequired,
    contextValue: PropTypes.object,
};

IconProvider.defaultProps = {
    contextValue: {},
};

export default IconProvider;
