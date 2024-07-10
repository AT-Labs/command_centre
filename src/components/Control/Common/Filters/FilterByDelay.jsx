import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Slider } from '@mui/material';
import debounce from 'lodash-es/debounce';
import { getTripStatusFilter } from '../../../../redux/selectors/control/routes/filters';
import { delayRangeAllowedTripStatuses } from '../../../../redux/actions/control/routes/filters';
import { getRoutesTripsDatagridConfig } from '../../../../redux/selectors/datagrid';

const FilterByDelay = (props) => {
    const delayLimitMin = props.delayRangeLimits.MIN;
    const delayLimitMax = props.delayRangeLimits.MAX;

    const [delayRange, setDelayRange] = React.useState([
        props.delayRange.min != null ? props.delayRange.min : delayLimitMin,
        props.delayRange.max != null ? props.delayRange.max : delayLimitMax,
    ]);

    const getDelayRangeLimits = range => ({
        min: range[0] === delayLimitMin ? null : range[0],
        max: range[1] === delayLimitMax ? null : range[1],
    });

    const updateDelayRange = () => {
        const updatedDelayRange = getDelayRangeLimits(delayRange);

        props.onRangeChange(updatedDelayRange);
    };

    const debouncedRangeUpdate = debounce(updateDelayRange, 1000);

    const handleRangeChange = (e, value) => {
        setDelayRange(value);

        debouncedRangeUpdate();
    };

    const calculateDelayText = (range) => {
        const min = range[0];
        const max = range[1];
        let earlyText = null;
        let lateText = null;

        if (min < 0 && max <= 0) {
            earlyText = `${0 - max} - ${0 - min}${min === delayLimitMin ? '+' : ''} min`;
        } else if (min >= 0 && max > 0) {
            lateText = `${min} - ${max}${max === delayLimitMax ? '+' : ''} min`;
        } else {
            earlyText = `${0 - min}${min === delayLimitMin ? '+' : ''} min`;
            lateText = `${max}${max === delayLimitMax ? '+' : ''} min`;
        }

        return [earlyText, lateText];
    };

    const disabled = !delayRangeAllowedTripStatuses.includes(props.tripStatusFilter)
        && !props.routesTripsDatagridConfig.filterModel.items?.find(item => item.columnField === 'status' && delayRangeAllowedTripStatuses.includes(item.value));

    const [early, late] = disabled ? [null, null] : calculateDelayText(delayRange);

    if (disabled && (delayLimitMin !== delayRange[0] || delayLimitMax !== delayRange[1])) {
        setDelayRange([delayLimitMin, delayLimitMax]);
    }

    return (
        <section>
            <label // eslint-disable-line
                htmlFor={ props.id }
                className="font-size-md font-weight-bold">
                {props.title}
            </label>
            <div className="mt-1 mb-1">
                <Slider
                    id={ props.id }
                    value={ delayRange }
                    onChange={ handleRangeChange }
                    valueLabelDisplay="auto"
                    aria-labelledby="range-slider-info"
                    min={ delayLimitMin }
                    max={ delayLimitMax }
                    disabled={ disabled }
                />
            </div>
            {!disabled && (
                <div className="font-size-sm">
                    <span className="font-weight-bold">Selected</span>
                    {early && (
                        <span className="font-weight-bold d-block">
                            Early:
                            <span className="font-weight-light">
                                {' '}
                                {early}
                                {' '}
                            </span>
                        </span>
                    )}
                    {late && (
                        <span className="font-weight-bold d-block">
                            Late:
                            <span className="font-weight-light">
                                {' '}
                                {late}
                                {' '}
                            </span>
                        </span>
                    )}
                </div>
            )}
        </section>
    );
};

FilterByDelay.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    delayRange: PropTypes.object.isRequired,
    delayRangeLimits: PropTypes.object.isRequired,
    onRangeChange: PropTypes.func.isRequired,
    tripStatusFilter: PropTypes.string.isRequired,
    routesTripsDatagridConfig: PropTypes.object.isRequired,
};

FilterByDelay.defaultProps = {
    title: 'Range Delay',
    id: 'filter-range-delay',
};

export default connect(state => ({
    tripStatusFilter: getTripStatusFilter(state),
    routesTripsDatagridConfig: getRoutesTripsDatagridConfig(state),
}), null)(FilterByDelay);
