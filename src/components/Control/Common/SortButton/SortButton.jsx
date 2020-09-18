import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Button } from 'reactstrap';
import { IoMdArrowDropup, IoMdArrowDropdown } from 'react-icons/io';
import './SortButton.scss';

const SortButton = props => (
    <ButtonGroup
        className={ `sort-btn d-flex flex-column ${props.className}` }
        vertical>
        <Button
            className="border-0 rounded-0 p-0 bg-white"
            onClick={ () => props.onClick(props.active === 'asc' ? 'desc' : 'asc') }>
            <div className={ `sort-btn__inner-btn d-flex ${props.active === 'asc' ? 'active' : ''}` }>
                <IoMdArrowDropup size={ 20 } />
            </div>
            <div className={ `sort-btn__inner-btn d-flex ${props.active === 'desc' ? 'active' : ''}` }>
                <IoMdArrowDropdown size={ 20 } />
            </div>
        </Button>
    </ButtonGroup>
);

SortButton.propTypes = {
    className: PropTypes.string,
    active: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

SortButton.defaultProps = {
    className: '',
    active: '',
};

export default SortButton;
