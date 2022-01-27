import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';

import Icon from '../../../Common/Icon/Icon';
import Loader from '../../../Common/Loader/Loader';

const createIconElement = (icon) => {
    if (typeof icon === 'string') {
        return <Icon icon={ icon } className="cc-btn-secondary__icon button-bar_icon" />;
    }

    return React.cloneElement(icon, { className: `${icon.props.className} button-bar_icon` });
};

const ButtonBar = ({ buttons, isLoading }) => (
    <section className="button-bar p-2 border-bottom border-secondary">
        { buttons.map(({
            label, icon, element, disable, action,
        }, index) => {
            if (element) {
                return React.cloneElement(element, { className: element.props.openModalButtonClass });
            }
            return (
                <button
                    type="button"
                    className="cc-btn-secondary mr-2"
                    key={ _.uniqueId() }
                    onClick={ () => action && action(index, label) }
                    tabIndex={ index }
                    aria-label={ label }
                    disabled={ !isLoading ? disable : isLoading }>
                    { icon ? createIconElement(icon) : '' }
                    <span className="align-middle ml-2">{ label }</span>
                </button>
            );
        }) }
        { isLoading && <div className="cc-standard-loader-wrapper button-bar__loader m-1 "><Loader /></div> }
    </section>
);

ButtonBar.propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        element: PropTypes.element,
        disable: PropTypes.bool,
        action: PropTypes.func,
    })).isRequired,
    isLoading: PropTypes.bool,
};

ButtonBar.defaultProps = {
    isLoading: true,
};

export default ButtonBar;
