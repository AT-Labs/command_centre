import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { IoIosCloseCircle } from 'react-icons/io';

import ControlTable from '../../../Common/ControlTable/ControlTable';
import { selectSingleTrip } from '../../../../../redux/actions/control/routes/trip-instances';

const UpdateTripStatusModalTable = (props) => {
    const { selectedTrips } = props;

    const onTripDeselect = trip => props.selectSingleTrip({ [trip.tripKey]: selectedTrips[trip.tripKey] });

    const renderTableRemoveButtons = trip => (
        <div className="cc-table-actions-col">
            <Button
                className="cc-btn-remove cc-btn-remove--lg"
                onClick={ () => onTripDeselect(trip) }>
                <IoIosCloseCircle size={ 20 } className="mr-1 text-danger" />
            </Button>
        </div>
    );

    const SELECTED_TRIPS_COLUMNS = [
        {
            label: 'route #',
            key: 'routeVariantId',
            cols: 'col-3',
        },
        {
            label: 'Start time',
            key: 'startTime',
            cols: 'col-3',
        },
        {
            label: 'Route',
            key: 'routeLongName',
            cols: 'col-4',
        },
        {
            label: 'Remove',
            key: '',
            cols: 'col-2',
            getContent: row => renderTableRemoveButtons(row),
        },
    ];

    return (
        <ControlTable
            columns={ SELECTED_TRIPS_COLUMNS }
            data={ _.compact(_.map(selectedTrips, (value, key) => ({
                routeVariantId: value.routeVariantId,
                startTime: value.startTime,
                routeLongName: value.routeLongName,
                status: value.status,
                tripKey: key,
            }))) }
            isLoading={ false }
            isExpandable={ false } />
    );
};

UpdateTripStatusModalTable.propTypes = {
    selectedTrips: PropTypes.object.isRequired,
    selectSingleTrip: PropTypes.func.isRequired,
};

export default connect(null, { selectSingleTrip })(UpdateTripStatusModalTable);
