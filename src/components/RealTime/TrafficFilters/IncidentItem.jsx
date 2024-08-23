import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import { getIconByIncidentCategory } from '../../Common/Map/TrafficLayer/TrafficHelper';
import { CategoryLabelMapping } from '../../../types/incidents';

import './IncidentItem.scss';

const IncidentItem = ({ id, title, onChange, checked, inputClassName }) => (
    <div className="incident-item d-flex flex-row  align-items-center justify-content-between mb-1">
        <div className="d-flex flex-row align-items-center">
            <div className="icon-container">{getIconByIncidentCategory(title)}</div>
            <span>{ CategoryLabelMapping[title] }</span>
        </div>
        <div>
            <Input type="checkbox" id={ id } className={ inputClassName } onChange={ onChange } checked={ checked } size={ 20 } />
        </div>
    </div>
);

IncidentItem.propTypes = {
    id: PropTypes.string,
    inputClassName: PropTypes.string,
    title: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
};

IncidentItem.defaultProps = {
    id: '',
    inputClassName: '',
};

export default IncidentItem;
