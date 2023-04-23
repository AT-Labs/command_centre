import React from 'react';
import PropTypes from 'prop-types';
import { useGridApiContext } from '@mui/x-data-grid-pro';
import moment from 'moment';
import { checkIfAllTripsAreSelected } from '../../../utils/helpers';
import { getAllNotCompletedTrips } from '../../../redux/selectors/control/routes/trip-instances';

export const CustomSelectionHeader = (props) => {
    const isDateServiceTodayOrTomorrow = () => moment(props.serviceDate).isBetween(moment(), moment().add(1, 'd'), 'd', '[]');

    const apiRef = useGridApiContext();
    const notCompleted = Object.fromEntries(apiRef.current.getRowModels());
    Object.keys(notCompleted).forEach((tripKey) => {
        notCompleted[tripKey] = notCompleted[tripKey].tripInstance;
    });
    const notCompletedTrips = getAllNotCompletedTrips(notCompleted);
    const selectedTrips = [...apiRef.current.getSelectedRows().keys()];

    return (
        <input
            type="checkbox"
            className="select-all-trips-checkbox mr-2"
            disabled={ !isDateServiceTodayOrTomorrow() }
            checked={ checkIfAllTripsAreSelected(Object.keys(notCompletedTrips), selectedTrips) }
            onChange={ props.selectAllTrips } />
    );
};

CustomSelectionHeader.propTypes = {
    serviceDate: PropTypes.string.isRequired,
    selectAllTrips: PropTypes.func.isRequired,
};
