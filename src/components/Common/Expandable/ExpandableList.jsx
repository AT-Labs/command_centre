import PropTypes from 'prop-types';
import React from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { Button } from 'reactstrap';
import Expandable from './Expandable';
import ExpandableContent from './ExpandableContent';
import ExpandableSummary from './ExpandableSummary';

export const ExpandableList = (props) => {
    const {
        id, isActive, onToggle, className, label, removeAction, children, disabled,
    } = props;

    return (
        <Expandable
            id={ id }
            isActive={ isActive }
            onToggle={ onToggle }
            className={ className }>
            <ExpandableSummary
                expandClassName="selection-item-header card-header d-inline-flex w-100"
                displayToggleButton={ false }>
                <div>
                    <Button
                        className="btn cc-btn-link pt-0 pl-0"
                        onClick={ onToggle }>
                        { isActive ? <IoIosArrowUp className="text-info" size={ 20 } /> : <IoIosArrowDown className="text-info" size={ 20 } /> }
                    </Button>
                </div>
                <div className="picklist__list-btn w-100 border-0 rounded-0 text-left">
                    { removeAction && (
                        <Button
                            className="cc-btn-link selection-item__button float-right p-0"
                            onClick={ removeAction }
                            disabled={ disabled }>
                            Remove
                            <span className="pl-3">X</span>
                        </Button>
                    )}
                    { label }
                </div>
            </ExpandableSummary>
            <ExpandableContent extendClassName="bg-white">
                {isActive && (
                    <ul className="selection-item-body card-body bg-white pb-0">
                        { children }
                    </ul>
                )}
            </ExpandableContent>
        </Expandable>
    );
};

ExpandableList.propTypes = {
    id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    isActive: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
    removeAction: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.element,
    ]),
    disabled: PropTypes.bool,
};

ExpandableList.defaultProps = {
    className: '',
    removeAction: null,
    children: [],
    disabled: false,
};

export default ExpandableList;
