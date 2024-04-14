import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Wizard from '../../../Common/wizard/Wizard';
import SearchTrip from './WizardSteps/SearchTrip';
import SelectAndAddTrip from './WizardSteps/SelectAndAddTrip';

import { updateCurrentStepHandler, resetAddTripStep, updateSelectedAddTrip, updateEnabledAddTripModal } from '../../../../redux/actions/control/routes/trip-instances';
import { getAddTripStep } from '../../../../redux/selectors/control/routes/trip-instances';
import { getModeRouteFilter } from '../../../../redux/selectors/control/routes/filters';
import { TRIP_DIRECTION_INBOUND } from '../../../../types/vehicle-types';
import { ADD_TRIP_STEPS } from '../Types';

import './style.scss';

const INIT_STATE = {
    route: {
        routeId: '',
        routeShortName: '',
    },
    mode: null,
    agency: {
        agencyId: '',
        agencyName: '',
    },
    serviceDateFrom: '',
    serviceDateTo: '',
    startTimeFrom: '',
    startTimeTo: '',
    directionId: TRIP_DIRECTION_INBOUND,
    viewType: 0,
};

export const AddTrip = (props) => {
    const [data, setData] = useState({ ...INIT_STATE, mode: props.routeType });

    const updateData = (key, value) => {
        setData({
            ...data,
            [key]: value,
        });
    };

    const onSubmit = () => {};

    const onSubmitUpdate = () => {};

    const renderSteps = () => {
        const steps = {
            [ADD_TRIP_STEPS.SEARCH_TRIPS]: (
                <li key="1" className={ props.activeStep === 0 ? 'active' : '' }>
                    Search Trips
                </li>
            ),
            [ADD_TRIP_STEPS.SELECT_AND_ADD_TRIP]: (
                <li key="2" className={ `position-relative ${props.activeStep === 1 ? 'active' : ''}` }>
                    Select and Add Trip
                </li>
            ),
        };

        return (
            <div className="add-trip__steps p-2 mb-2">
                <ol>
                    {[
                        steps[ADD_TRIP_STEPS.SEARCH_TRIPS],
                        steps[ADD_TRIP_STEPS.SELECT_AND_ADD_TRIP],
                    ]}
                </ol>
            </div>
        );
    };

    useEffect(() => () => {
        props.resetAddTripStep();
    }, []);

    const getHeader = () => (
        <>
            <h2 className="mb-2">Add Trip</h2>
            {renderSteps()}
        </>
    );

    const handlerCloseAddTripModal = () => {
        props.updateEnabledAddTripModal(false);
        props.updateSelectedAddTrip(null);
    };

    return (
        <div className="control-routes-view">
            <div className="add-trip__container">
                <div className="row">
                    <div className={ props.activeStep === 0 ? 'col-md-6 offset-md-3' : 'col-12' }>
                        <Wizard
                            className="add-trip__wizard p-0"
                            data={ data }
                            onDataUpdate={ updateData }
                            onStepUpdate={ (step) => {
                                props.updateCurrentStepHandler(step);
                            } }
                            onSubmit={ onSubmit }
                            onSubmitUpdate={ onSubmitUpdate }>
                            <SearchTrip header={ getHeader() } toggleAddTripModals={ handlerCloseAddTripModal } />
                            <SelectAndAddTrip header={ getHeader() } viewType="Routes" />
                        </Wizard>
                    </div>
                </div>
            </div>
        </div>
    );
};

AddTrip.propTypes = {
    updateCurrentStepHandler: PropTypes.func.isRequired,
    resetAddTripStep: PropTypes.func.isRequired,
    activeStep: PropTypes.number,
    routeType: PropTypes.number,
    updateEnabledAddTripModal: PropTypes.func.isRequired,
    updateSelectedAddTrip: PropTypes.func.isRequired,
};

AddTrip.defaultProps = {
    activeStep: 0,
    routeType: null,
};

export default connect(state => ({
    activeStep: getAddTripStep(state),
    routeType: getModeRouteFilter(state),
}), {
    updateCurrentStepHandler, resetAddTripStep, updateSelectedAddTrip, updateEnabledAddTripModal,
})(AddTrip);
