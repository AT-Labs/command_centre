import React from 'react';
import PropTypes from 'prop-types';

import { AiOutlineReload } from 'react-icons/ai';

const ResetButton = ({ onClick, label, className }) => (
    <button
        type="button"
        className={ className }
        aria-label={ label }
        onClick={ onClick }>
        { label }
        <AiOutlineReload color="black" size={ 25 } />
    </button>
);

ResetButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string,
    className: PropTypes.string,
};

ResetButton.defaultProps = {
    label: 'Reset search',
    className: 'search__reset',
};

export default ResetButton;
