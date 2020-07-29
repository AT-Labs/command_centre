import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import _ from 'lodash-es';

const CustomButton = ({
    className,
    ariaLabel,
    isDisabled,
    color,
    size,
    onClick,
    children,
    active,
    id,
}) => {
    const formattedChildren = children.isArray ? children : React.Children.toArray(children);
    const idProp = id ? { id } : {};
    return (
        <Button
            className={ className }
            disabled={ isDisabled }
            size={ size }
            color={ color }
            active={ active }
            tabIndex="0"
            aria-label={ ariaLabel }
            onClick={ onClick }
            { ...idProp }
        >
            {
                _.map(formattedChildren, child => (
                    <React.Fragment key={ _.uniqueId() }>
                        { child }
                    </React.Fragment>
                ))
            }
        </Button>
    );
};

CustomButton.propTypes = {
    className: PropTypes.string,
    ariaLabel: PropTypes.string,
    color: PropTypes.string,
    size: PropTypes.string,
    isDisabled: PropTypes.bool,
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    id: PropTypes.string,
};

CustomButton.defaultProps = {
    className: '',
    ariaLabel: 'button',
    color: 'primary',
    size: 'sm',
    isDisabled: false,
    active: false,
    id: '',
};

export default CustomButton;
