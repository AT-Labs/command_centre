import React from 'react';
import { size } from 'lodash-es';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { IoIosCloseCircle } from 'react-icons/io';

import './BusPriorityFooter.scss';

const BusPriorityFooter = (props) => {
    const { selectedRow } = props;

    return (
        <div className="d-flex align-items-center ml-3 mr-3">
            <div>
                <span>
                    { `${size(selectedRow)} routes selected` }
                </span>
            </div>
            <div className="border-right">
                <Button
                    className="cc-btn-link pb-2"
                    onClick={ props.deselectAllItems }>
                    Deselect all
                </Button>
            </div>
            <div className="align-item-center ml-3">
                <Button
                    size="sm"
                    className="btn-cancel cc-btn-secondary d-flex align-items-center mr-3"
                    onClick={ props.onClick }>
                    <IoIosCloseCircle size={ 20 } />
                    Delete Routes
                </Button>
            </div>
        </div>
    );
};

BusPriorityFooter.propTypes = {
    selectedRow: PropTypes.array,
    deselectAllItems: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
};

BusPriorityFooter.defaultProps = {
    selectedRow: [],
};

export default BusPriorityFooter;
