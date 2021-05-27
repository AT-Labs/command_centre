import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon/Icon';
import './BackHeader.scss';

const BackHeader = (props) => {
    const { onClick, text, classProps } = props;
    return (
        <div className={ classProps.container }>
            <button className={ classProps.button } type="button" onClick={ onClick }>
                <Icon className={ classProps.icon } icon="arrow-left" />
                <span className={ classProps.title }>{text}</span>
            </button>
        </div>
    );
};

BackHeader.propTypes = {
    onClick: PropTypes.func,
    text: PropTypes.string,
    classProps: PropTypes.object,
};

BackHeader.defaultProps = {
    onClick: () => {
    },
    text: '',
    classProps: {
        container: 'back-header mb-3 text-left',
        button: 'back-header__header mb-0',
        icon: 'back-header__btn-icon mr-2',
        title: 'text-muted back-header__title',
    },
};

export default BackHeader;
