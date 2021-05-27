import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import Icon from '../../Icon/Icon';

import { toggleRealTimeSidePanel } from '../../../../redux/actions/navigation';
import './SidePanel.scss';

const SidePanel = (props) => {
    const { isOpen, isActive, position, children, toggleButton, className } = props;
    return (
        <section className={ `side-panel ${isActive ? 'side-panel--active' : ''} ${isOpen ? 'side-panel--open' : ''} side-panel--${position} ${className}` }>
            <div className="side-panel__inner h-100 d-flex position-relative flex-column">
                { children }
            </div>
            {
                toggleButton && isActive
                    && (
                        <Button
                            className="side-panel__toggle-btn"
                            color="primary"
                            tabIndex="-1"
                            aria-label="Side panel toggle button"
                            onClick={ props.toggleRealTimeSidePanel }>
                            <Icon className="side-panel__toggle-btn-icon" icon={ isOpen ? 'arrow-left' : 'arrow-right' } />
                        </Button>
                    )
            }
        </section>
    );
};

SidePanel.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    toggleRealTimeSidePanel: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    toggleButton: PropTypes.bool,
    isActive: PropTypes.bool.isRequired,
    position: PropTypes.oneOf(['left', 'right']),
    className: PropTypes.string,
};

SidePanel.defaultProps = {
    position: 'left',
    toggleButton: true,
    className: '',
};

export default connect(null, { toggleRealTimeSidePanel })(SidePanel);
