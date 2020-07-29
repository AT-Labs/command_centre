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
            className={ `sort-btn__inner-btn bg-white border-0 rounded-0 p-0 d-flex ${props.active === 'asc' ? 'active' : ''}` }
            onClick={ () => props.onClick('asc') }>
            <IoMdArrowDropup size={ 20 } />
        </Button>
        <Button
            className={ `sort-btn__inner-btn bg-white border-0 rounded-0 p-0 d-flex ${props.active === 'desc' ? 'active' : ''}` }
            onClick={ () => props.onClick('desc') }>
            <IoMdArrowDropdown size={ 20 } />
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
