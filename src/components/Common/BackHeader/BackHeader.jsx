import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon/Icon';
import './BackHeader.scss';

const BackHeader = (props) => {
    const { onClick, text } = props;
    return (
        <div className="back-header mb-3 text-left">
            <button className="back-header__header mb-0" type="button" onClick={ onClick }>
                <Icon className="back-header__btn-icon mr-2" icon="arrow-left" />
                <span className="text-muted back-header__title">{text}</span>
            </button>
        </div>
    );
};

BackHeader.propTypes = {
    onClick: PropTypes.func,
    text: PropTypes.string,
};

BackHeader.defaultProps = {
    onClick: () => {
    },
    text: '',
};

export default BackHeader;
