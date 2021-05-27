import React from 'react';
import PropTypes from 'prop-types';

import { AiOutlineReload } from 'react-icons/ai';

const ResetButton = ({ onClick, label }) => (
    <button
        type="button"
        className="search__reset"
        aria-label={ label }
        onClick={ onClick }>
        { label }
        <AiOutlineReload color="black" size={ 25 } />
    </button>
);

ResetButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string,
};

ResetButton.defaultProps = {
    label: 'Reset search',
};

export default ResetButton;
