import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment';
import { FormGroup, Label, Input } from 'reactstrap';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import SearchFilter from '../../Common/Filters/SearchFilter/SearchFilter';
import FilterByOperator from '../../Common/Filters/FilterByOperator';
import { getSearchResults } from '../../../../redux/selectors/search';
import { getRestrictedAgencies } from '../../../../redux/selectors/control/agencies';
import { checkValidityOfInputField, displayOperatorPermissionError } from '../../../../redux/actions/control/routes/addRecurringCancellations';
import { TIME_FORMAT_HHMM, TIME_FORMAT_HHMMSS } from '../../../../utils/dateUtils';
import './RecurringCancellationsView.scss';

const ModalWithAdditionalInputField = (props) => {
    const { allowUpdate, searchResults, restrictOperatorData } = props;
    const { routeVariant, startTime, route, operator } = props.setting;
    const [isOperatorAndRouteDisabled, setIsOperatorAndRouteDisabled] = useState(false);
    const [isRouteVariantValid, setIsRouteVariantValid] = useState(false);
    const [isRouteValid, setIsRouteValid] = useState(false);

    useEffect(() => {
        if (restrictOperatorData.length === 1) {
            props.onChange({ operator: restrictOperatorData[0].value });
        }
    }, []);

    const updateAutoFillOperator = (autoFillOperatorValue) => {
        const autoUpdateAllowedValue = restrictOperatorData.filter(option => option.value === autoFillOperatorValue)[0];
        if (autoUpdateAllowedValue) {
            props.onChange({ operator: autoFillOperatorValue });
        } else {
            props.displayOperatorPermissionError(true);
            if (operator) {
                props.onChange({ operator: '' });
            }
        }
    };

    const routeVariantValid = (value) => {
        if (!_.isEmpty(value) && value.length > 10) {
            setIsRouteVariantValid(true);
            props.checkValidityOfInputField({ isRouteVariantValid: false });
        } else {
            setIsRouteVariantValid(false);
            props.checkValidityOfInputField({ isRouteVariantValid: true });
        }
    };

    const startTimeValid = () => _.isEmpty(startTime) || (moment(startTime, TIME_FORMAT_HHMM, true).isValid() || moment(startTime, TIME_FORMAT_HHMMSS, true).isValid());

    const routeValid = (value) => {
        if (!_.isEmpty(value) && value.length > 10) {
            setIsRouteValid(true);
            props.checkValidityOfInputField({ isRouteValid: false });
        } else {
            setIsRouteValid(false);
            props.checkValidityOfInputField({ isRouteValid: true });
        }
    };

    const enableAndClearOperatorAndRoute = () => {
        setIsOperatorAndRouteDisabled(false);
        if (isOperatorAndRouteDisabled) {
            props.onChange({ route: '' });
            props.onChange({ operator: '' });
        }
    };

    const routeVariantIdActionHandler = {
        selection: {
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: (selectedOption) => {
                props.onChange({ routeVariant: _.get(selectedOption, 'data.routeVariantId') });
                props.onChange({ route: _.get(selectedOption, 'data.routeShortName') });
                setIsOperatorAndRouteDisabled(true);
                props.checkValidityOfInputField({ isRouteValid: true });
                updateAutoFillOperator(_.get(selectedOption, 'data.agencyId'));
            },
        },
        clear: {
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: () => {
                _.noop();
                enableAndClearOperatorAndRoute();
                props.checkValidityOfInputField({ isRouteValid: false });
            },
        },
    };

    useEffect(() => {
        const routeData = searchResults[SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type];
        if (routeData.length === 1) {
            routeVariantIdActionHandler.selection[SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type](routeData[0]);
        }
    }, [searchResults]);

    const routeActionHandler = {
        selection: {
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: selectedOption => props.onChange({ route: _.get(selectedOption, 'data.routeShortName') }),
        },
        clear: {
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: _.noop,
        },
    };

    const handleInputValueChangeRouteVariant = (value) => {
        props.onChange({ routeVariant: value });
        routeVariantValid(value);
        if (isOperatorAndRouteDisabled) {
            setIsOperatorAndRouteDisabled(false);
        }
    };

    const handleInputValueChangeRoute = (value) => {
        props.onChange({ route: value });
        routeValid(value);
    };

    const onRouteVariantClearCallBack = () => {
        props.onChange({ routeVariant: '' });
        enableAndClearOperatorAndRoute();
    };

    const handleInputValueChangeStartTime = (value) => {
        props.onChange({ startTime: value });
        if (!_.isEmpty(value) && (moment(value, TIME_FORMAT_HHMMSS, true).isValid() || moment(value, TIME_FORMAT_HHMM, true).isValid())) {
            props.checkValidityOfInputField({ isStartTimeValid: true });
        } else {
            props.checkValidityOfInputField({ isStartTimeValid: false });
        }
    };

    return (
        <div className="route-variant-route-operator">
            <div className="row">
                <FormGroup id="recurrent-trip-cancellation__route-variant" className={ isRouteVariantValid ? 'position-relative col-6 invalid-input' : 'position-relative col-6' }>
                    <Label for="recurrent-trip-cancellation__route-variant">
                        <span className="font-size-md font-weight-bold">Route Variant</span>
                    </Label>
                    <SearchFilter
                        isDisabled={ !allowUpdate }
                        value={ routeVariant }
                        placeholder="Search route variant"
                        searchInCategory={ [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type] }
                        selectionHandlers={ routeVariantIdActionHandler.selection }
                        clearHandlers={ routeVariantIdActionHandler.clear }
                        onHandleInputValueChange={ handleInputValueChangeRouteVariant }
                        isValid={ !isRouteVariantValid }
                        onClearCallBack={ onRouteVariantClearCallBack } />
                </FormGroup>
                <div className="position-relative col-6">
                    <FormGroup>
                        <Label for="recurrent-trip-cancellation__start-time">
                            <span className="font-size-md font-weight-bold">Start Time</span>
                        </Label>
                        <Input
                            disabled={ !allowUpdate }
                            className="border border-dark"
                            placeholder="Enter start time"
                            id="recurrent-trip-cancellation__start-time"
                            value={ startTime }
                            onChange={ e => handleInputValueChangeStartTime(e.target.value) }
                            invalid={ !startTimeValid() }
                        />
                    </FormGroup>
                </div>
            </div>
            <div className="row mb-n3">
                <FormGroup id="recurrent-trip-cancellation__operator" className="position-relative col-6">
                    <FilterByOperator
                        id={ allowUpdate ? 'control-filters-operators-search' : 'display-control-filters-operators-search-only' }
                        selectedOption={ operator }
                        customData={ restrictOperatorData }
                        isDisabled={ !allowUpdate || isOperatorAndRouteDisabled }
                        onSelection={ selectedOption => props.onChange({ operator: selectedOption.value }) } />
                </FormGroup>
                <FormGroup id="recurrent-trip-cancellation__route" className={ isRouteValid ? 'position-relative col-6 invalid-input' : 'position-relative col-6' }>
                    <Label for="recurrent-trip-cancellation__route">
                        <span className="font-size-md font-weight-bold">Route</span>
                    </Label>
                    <SearchFilter
                        isDisabled={ !allowUpdate || isOperatorAndRouteDisabled }
                        value={ route }
                        placeholder="Search for a route"
                        searchInCategory={ [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type] }
                        selectionHandlers={ routeActionHandler.selection }
                        onHandleInputValueChange={ handleInputValueChangeRoute }
                        clearHandlers={ routeActionHandler.clear }
                        isValid={ !isRouteValid }
                        onClearCallBack={ () => props.onChange({ route: '' }) } />
                </FormGroup>
            </div>
        </div>
    );
};

ModalWithAdditionalInputField.propTypes = {
    onChange: PropTypes.func,
    allowUpdate: PropTypes.bool.isRequired,
    setting: PropTypes.shape({
        startTime: PropTypes.string.isRequired,
        routeVariant: PropTypes.string.isRequired,
        route: PropTypes.string.isRequired,
        operator: PropTypes.string.isRequired,
    }).isRequired,
    searchResults: PropTypes.object.isRequired,
    restrictOperatorData: PropTypes.array.isRequired,
    checkValidityOfInputField: PropTypes.func.isRequired,
    displayOperatorPermissionError: PropTypes.func.isRequired,
};

ModalWithAdditionalInputField.defaultProps = {
    onChange: () => {
        // do nothing
    },
};

export default connect(state => ({
    searchResults: getSearchResults(state),
    restrictOperatorData: getRestrictedAgencies(state),
}), {
    checkValidityOfInputField,
    displayOperatorPermissionError,
})(ModalWithAdditionalInputField);
