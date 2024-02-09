import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CongestionFilters.scss';
import { Button, ButtonGroup } from 'reactstrap';

export const Filters = {
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
};

const CongestionFilters = (props) => {
    const [selectedFilters, setSelectedFilters] = useState(props.selectedFilters);

    const onBtnClick = (selected) => {
        const index = selectedFilters.indexOf(selected);
        if (index < 0) {
            selectedFilters.push(selected);
        } else {
            selectedFilters.splice(index, 1);
        }
        setSelectedFilters([...selectedFilters]);
        if (props.onFiltersChanged) {
            props.onFiltersChanged([...selectedFilters]);
        }
    };

    return (
        <div className="traffic-filters position-fixed">
            <div className="text-center rounded-0 live-traffic-bg">
                Live Traffic
            </div>
            <ButtonGroup>
                <Button
                    size="sm"
                    className="traffic-filters-high"
                    color={ selectedFilters.includes(Filters.High) ? 'danger' : 'secondary' }
                    active={ selectedFilters.includes(Filters.High) }
                    onClick={ () => onBtnClick(Filters.High) }>
                    High
                </Button>
                <Button
                    size="sm"
                    className="traffic-filters-medium"
                    color={ selectedFilters.includes(Filters.Medium) ? 'warning' : 'secondary' }
                    active={ selectedFilters.includes(Filters.Medium) }
                    onClick={ () => onBtnClick(Filters.Medium) }>
                    Medium
                </Button>
                <Button
                    size="sm"
                    className="traffic-filters-low"
                    color={ selectedFilters.includes(Filters.Low) ? 'success' : 'secondary' }
                    active={ selectedFilters.includes(Filters.Low) }
                    onClick={ () => onBtnClick(Filters.Low) }>
                    Low
                </Button>
            </ButtonGroup>
        </div>
    );
};

CongestionFilters.propTypes = {
    selectedFilters: PropTypes.array,
    onFiltersChanged: PropTypes.func,
};

CongestionFilters.defaultProps = {
    selectedFilters: [],
    onFiltersChanged: undefined,
};

export default CongestionFilters;
