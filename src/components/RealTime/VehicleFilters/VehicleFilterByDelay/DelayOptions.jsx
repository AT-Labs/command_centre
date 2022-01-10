import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';
import Slider from '@material-ui/core/Slider';

const DEFAULT_RANGE_VALUE = [5, 15];

const RANGE_LIMITS = {
    MIN: 0,
    MAX: 30,
};

export default class DelayOptions extends React.PureComponent {
    static propTypes = {
        range: PropTypes.arrayOf(PropTypes.number),
        onChange: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
    };

    static defaultProps = {
        range: null,
    };

    handleRangeToggle = (e) => {
        const { checked } = e.target;
        const value = checked ? DEFAULT_RANGE_VALUE : null;
        this.props.onChange(this.props.type, value, false);
    };

    handleRangeChange = (e, value) => {
        this.props.onChange(this.props.type, value, true);
    };

    handleMoreThan = () => {
        this.props.onChange(this.props.type, [30, Infinity], false);
    };

    render() {
        const { range, type } = this.props;
        const isShowingDelay = !!range;
        const isCustomRange = range && range[1] !== Infinity;
        const prettyType = type[0].toUpperCase() + type.slice(1);
        const prettyRange = isCustomRange ? `${range[0]} to ${range[1]}` : '30 or more';
        return (
            <FormGroup check>
                <Label check>
                    <Input
                        type="checkbox"
                        name={ type }
                        checked={ isShowingDelay }
                        onChange={ this.handleRangeToggle }
                        className="vehicle-filter-by-status__checkbox"
                    />
                    <span className="font-weight-light">{ prettyType }</span>
                    {isShowingDelay && (
                        <span className="font-weight-light"> ({prettyRange} minutes {type})</span>
                    )}
                </Label>
                {!!isShowingDelay && (
                    <div className="mt-2 ml-3 mb-2">
                        <Label check>
                            <Input
                                type="radio"
                                name={ `${this.props.type}-custom` }
                                checked={ isCustomRange }
                                onChange={ this.handleRangeToggle }
                                className="vehicle-filter-by-status__checkbox"
                            />
                            <span>Custom</span>
                        </Label>
                        {isCustomRange && (
                            <div className="mt-1 mb-1">
                                <Slider
                                    value={ range }
                                    onChange={ this.handleRangeChange }
                                    valueLabelDisplay="auto"
                                    aria-labelledby="range-slider-info"
                                    min={ RANGE_LIMITS.MIN }
                                    max={ RANGE_LIMITS.MAX }
                                />
                            </div>
                        )}
                        <Label check>
                            <Input
                                type="radio"
                                name={ `${this.props.type}-morethan` }
                                checked={ !isCustomRange }
                                onChange={ this.handleMoreThan }
                                className="vehicle-filter-by-status__checkbox"
                            />
                            <span>More than 30 minutes</span>
                        </Label>
                    </div>
                )}
            </FormGroup>
        );
    }
}
