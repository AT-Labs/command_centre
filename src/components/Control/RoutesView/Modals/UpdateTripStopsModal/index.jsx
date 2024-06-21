import { values } from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { IoIosCloseCircle } from 'react-icons/io';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import { updateStopsModalTypes } from '../../Types';
import Stops from '../../../Common/Stops/Stops';
import './styles.scss';
import { bulkUpdateTripStops } from '../../../../../utils/transmitters/trip-mgt-api';
import { markStopsAsFirstOrLast } from '../../../../../utils/control/routes';

const UpdateTripStopsModal = (props) => {
    const maxTripsToUpdate = 30;
    const [areTripsUpdating, setAreTripsUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState(values(props.operateTrips).length <= maxTripsToUpdate ? '' : `The maximum number of trips that can be updated at once is ${maxTripsToUpdate}.`);
    const [selectedTrips, setSelectedTrips] = useState(values(props.operateTrips).map(trip => ({ ...trip, stops: markStopsAsFirstOrLast(trip.stops) })));
    const [tripTemplate, setTripTemplate] = useState({
        ...selectedTrips[0],
        tripId: null,
    });
    const [canUpdate, setCanUpdate] = useState(values(props.operateTrips).length <= maxTripsToUpdate);

    const modalOnClose = (result) => {
        props.onClose(result);
    };

    const removeRow = (id) => {
        const updatedSelectedTrips = selectedTrips.filter(trip => trip.tripId !== id);
        setSelectedTrips(updatedSelectedTrips);
        if (updatedSelectedTrips.length > maxTripsToUpdate) {
            setErrorMessage(`The maximum number of trips that can be updated at once is ${maxTripsToUpdate}.`);
        } else {
            setErrorMessage('');
        }
        setCanUpdate(updatedSelectedTrips.length <= maxTripsToUpdate);
    };

    const handleStopUpdate = (options) => {
        const updatedStops = tripTemplate.stops.map((stop) => {
            if (options.stopCodes.includes(stop.stopCode)) {
                if (options.action === updateStopsModalTypes.CHANGE_PLATFORM) {
                    return {
                        ...stop,
                        platformCode: options.newPlatform.platform_code,
                        stopCode: options.newPlatform.stop_code,
                        stopId: options.newPlatform.stop_id,
                        stopLat: options.newPlatform.stop_lat,
                        stopLon: options.newPlatform.stop_lon,
                        stopName: options.newPlatform.stop_name,
                    };
                }
            }
            return stop;
        });
        setTripTemplate({ ...tripTemplate, stops: updatedStops });
    };

    const generateStopUpdates = () => {
        const stopUpdates = [];
        const originalTrip = selectedTrips[0];
        for (let i = 0; i < tripTemplate.stops.length; i++) {
            // compare the template with the original trip
            if (tripTemplate.stops[i].stopId !== originalTrip.stops[i].stopId) {
                stopUpdates.push({
                    stopId: tripTemplate.stops[i].stopId,
                    stopSequence: tripTemplate.stops[i].stopSequence,
                });
            }
        }
        return stopUpdates;
    };

    const updateStops = async () => {
        const stopsToUpdate = generateStopUpdates();

        if (stopsToUpdate.length === 0) {
            setErrorMessage('No stop changes to update.');
            return;
        }

        const tripsToUpdate = selectedTrips.map(t => ({
            tripId: t.tripId,
            serviceDate: t.serviceDate,
            startTime: t.startTime,
        }));

        const request = {
            tripIds: tripsToUpdate,
            stops: stopsToUpdate,
        };

        setAreTripsUpdating(true);
        try {
            await bulkUpdateTripStops(request)
                .then(() => {
                    setErrorMessage('');
                    modalOnClose({
                        actionType: 'success',
                        message: `Successfully updated stops for ${tripsToUpdate.length} trips.`,
                    });
                })
                .catch((error) => {
                    setErrorMessage(error);
                })
                .finally(() => setAreTripsUpdating(false));
        } catch {
            setErrorMessage('Failed to update stops.');
        }
    };

    return (
        <CustomModal
            className="cc-modal-standard-width update-trip-stops-modal"
            onClose={ modalOnClose }
            isModalOpen
            title="Update Stops">
            <div className="col-12">
                <div id="update-trip-stops-modal__route-variant-name"><b>{ tripTemplate.routeLongName }</b></div>
                <Stops
                    tripInstance={ tripTemplate }
                    onStopUpdated={ handleStopUpdate }
                    showScheduled={ false }
                    showActuals={ false }
                    hideFooter />

                <div className="add-trips-table-container d-flex flex-column justify-content-center">
                    <div className="add-trips-table scrollable-div">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>REMOVE</TableCell>
                                    <TableCell>ROUTE VARIANT</TableCell>
                                    <TableCell>START TIME</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedTrips.map(trip => (
                                    <TableRow key={ trip.tripId }>
                                        <TableCell>
                                            { selectedTrips.length > 1 && (
                                                <Button title="Remove"
                                                    className="update-stops-trips-table__remove-button cc-btn-secondary align-items-center mr-3"
                                                    onClick={ () => removeRow(trip.tripId) }>
                                                    <IoIosCloseCircle size={ 20 } />
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            { trip.routeVariantId }
                                        </TableCell>
                                        <TableCell>
                                            { trip.startTime }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <p className="font-weight-light cc-text-orange text-center mb-0">{ errorMessage }</p>
                    <div className="d-flex justify-content-center">
                        <Button
                            id="update-trip-stops-modal__update-button"
                            className="btn cc-btn-primary continue mt-3"
                            aria-label="Update Stops"
                            onClick={ updateStops }
                            disabled={ areTripsUpdating || !canUpdate }
                            isLoading={ areTripsUpdating }
                        >
                            Update Stops
                        </Button>
                    </div>
                </div>
            </div>
        </CustomModal>

    );
};

UpdateTripStopsModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    operateTrips: PropTypes.object.isRequired,
};

UpdateTripStopsModal.defaultProps = {
};

export default connect(
    () => ({
    }),
    { },
)(UpdateTripStopsModal);
