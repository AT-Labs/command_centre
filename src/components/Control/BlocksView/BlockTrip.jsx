import _ from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { goToRoutesView } from '../../../redux/actions/control/link';
import { getUserPermissions } from '../../../redux/selectors/user';
import VEHICLE_TYPE from '../../../types/vehicle-types';
import ButtonBar from '../Common/ButtonBar/ButtonBar';
import TripDetails from '../Common/Trip/TripDetails';
import { TripType } from './types';

const BlockTrip = (props) => {
    const { trip, userPermissions } = props;
    const isControlRoutesViewPermitted = _.get(userPermissions, 'controlRoutesView', false);
    const getTripDetailsData = () => [
        [
            { name: 'External Ref ID', value: trip.externalRef || '—' },
            { name: 'Route number', value: trip.routeVariantId || '—' },
        ], [
            { name: 'Mode', value: _.capitalize(VEHICLE_TYPE[trip.routeType].type) || '—' },
            { name: 'Service date', value: moment(trip.serviceDate).format('DD MMM YYYY') || '—' },
        ],
    ];

    const buttonBarConfig = [{
        label: 'View in Routes & Trips',
        action: () => props.goToRoutesView(
            trip,
            {
                agencyId: trip.agencyId || '',
                routeType: trip.routeType,
                isGroupedByRoute: true,
                isGroupedByRouteVariant: true,
                startTimeFrom: '',
                startTimeTo: '',
                tripStatus: '',
                routeShortName: '',
                routeVariantId: '',
            },
        ),
    }];

    return (
        <>
            { isControlRoutesViewPermitted && (<ButtonBar buttons={ buttonBarConfig } isLoading={ false } />) }
            <TripDetails data={ getTripDetailsData() } />
        </>
    );
};

BlockTrip.propTypes = {
    trip: TripType.isRequired,
    goToRoutesView: PropTypes.func.isRequired,
    userPermissions: PropTypes.shape({
        controlRoutesView: PropTypes.bool.isRequired,
    }).isRequired,
};

export default connect(
    state => ({
        userPermissions: getUserPermissions(state),
    }),
    { goToRoutesView },
)(BlockTrip);
