import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { uniqueId } from 'lodash-es';
import { Input } from 'reactstrap';
import { BsPencilSquare } from 'react-icons/bs';
import { IconButton, Tooltip } from '@mui/material';
import CustomDataGrid from '../../../Common/CustomDataGrid/CustomDataGrid';
import { getAllBusPriorityIntersections,
    getBusPriorityIntersectionsDatagridConfig,
    getIsLoadingBusPriorityIntersections,
    isBusPriorityEditAllowed } from '../../../../redux/selectors/control/dataManagement/busPriority';
import { deleteBusPriorityRoutes,
    getBusPriorityIntersections,
    updateBusPriorityIntersectionsDatagridConfig,
    updateBusPriorityIntersection } from '../../../../redux/actions/control/dataManagement';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ModalAlert from '../../BlocksView/BlockModals/ModalAlert';

export const LABEL_PARTITION_KEY = 'Partition Key';
export const LABEL_ROW_KEY = 'Row Key';
export const LABEL_BUS_ROUTE = 'Bus Route';
export const LABEL_DIRECTION_ID = 'Direction Id';
export const LABEL_GEOFENCE_RADIUS = 'Geofence Radius';
export const LABEL_GEOMETRY_REVISION = 'Geometry Revision';
export const LABEL_LANE_MOVEMENTS = 'Lane Movements';
export const LABEL_LATITUDE = 'Latitude';
export const LABEL_LONGITUDE = 'Longitude';
export const LABEL_SITE_ID = 'Site Id';
export const LABEL_TRAVEL_TIME = 'Travel Time';

export const BusPriorityIntersectionsDataGrid = (props) => {
    const [isEditIntersectionModalOpen, setIsEditIntersectionModalOpen] = useState(false);
    const [editIntersectionEntity, setEditIntersectionEntity] = useState({});
    const [newGeofenceRadius, setNewGeofenceRadius] = useState(0);
    const [newTravelTime, setNewTravelTime] = useState(0);

    useEffect(() => {
        props.getBusPriorityIntersections();
    }, []);

    const toggleEditModal = row => (
        [
            <Tooltip title="Edit Intersection" placement="top-end" key={ uniqueId(row.rowKey) }>
                <IconButton aria-label="open-edit-intersection"
                    onClick={ () => {
                        setNewTravelTime(row.Travel_Time);
                        setNewGeofenceRadius(row.Geofence_Radius);
                        setEditIntersectionEntity(row);
                        setIsEditIntersectionModalOpen(true);
                    } }>
                    <BsPencilSquare />
                </IconButton>
            </Tooltip>,
        ]
    );

    const GRID_COLUMNS = [
        {
            field: 'partitionKey',
            headerName: LABEL_PARTITION_KEY,
            width: 100,
            type: 'string',
            hide: true,
            filterable: false,
        },
        {
            field: 'rowKey',
            headerName: LABEL_ROW_KEY,
            width: 100,
            type: 'string',
            hide: true,
            filterable: false,
        },
        {
            field: 'Bus_Route',
            headerName: LABEL_BUS_ROUTE,
            width: 100,
            type: 'string',
            filterable: true,
        },
        {
            field: 'Direction_Id',
            headerName: LABEL_DIRECTION_ID,
            width: 125,
            type: 'string',
            filterable: true,
        },
        {
            field: 'Site_Id',
            headerName: LABEL_SITE_ID,
            width: 75,
            type: 'string',
            filterable: true,
        },
        {
            field: 'Travel_Time',
            headerName: LABEL_TRAVEL_TIME,
            width: 120,
            type: 'string',
            filterable: true,
        },
        {
            field: 'Geofence_Radius',
            headerName: LABEL_GEOFENCE_RADIUS,
            width: 150,
            type: 'string',
            filterable: true,
        },
        {
            field: 'Geometry_Revision',
            headerName: LABEL_GEOMETRY_REVISION,
            width: 175,
            type: 'string',
            filterable: true,
        },
        {
            field: 'Lane_Movements',
            headerName: LABEL_LANE_MOVEMENTS,
            width: 150,
            type: 'string',
            hide: true,
            filterable: false,
        },
        {
            field: 'Latitude',
            headerName: LABEL_LATITUDE,
            width: 125,
            type: 'string',
            filterable: true,
        },
        {
            field: 'Longitude',
            headerName: LABEL_LONGITUDE,
            width: 125,
            type: 'string',
            filterable: true,
        },
        {
            field: 'action',
            headerName: 'ACTION',
            type: 'actions',
            width: 200,
            renderHeader: () => (<span />),
            getActions: params => toggleEditModal(params.row),
        },
    ];

    const updateIntersection = () => {
        const intersection = editIntersectionEntity;
        intersection.Geofence_Radius = Number(newGeofenceRadius);
        intersection.Travel_Time = Number(newTravelTime);

        props.updateBusPriorityIntersection(intersection);

        setIsEditIntersectionModalOpen(false);
        setEditIntersectionEntity({});
        setNewGeofenceRadius(0);
        setNewTravelTime(0);
    };

    return (
        <div>
            <CustomDataGrid
                gridClassNames="vh-80"
                loading={ props.isLoading }
                columns={ GRID_COLUMNS }
                datagridConfig={ props.datagridConfig }
                dataSource={ props.busPriorityIntersections }
                updateDatagridConfig={ config => props.updateBusPriorityIntersectionsDatagridConfig(config) }
                getRowId={ row => row.rowKey }
            />

            <CustomModal
                title="Edit Intersections"
                isModalOpen={ isEditIntersectionModalOpen }
                onClose={ () => {
                    setIsEditIntersectionModalOpen(false);
                    setEditIntersectionEntity({});
                    setNewGeofenceRadius(0);
                    setNewTravelTime(0);
                } }
                okButton={ {
                    label: 'Save Changes',
                    onClick: updateIntersection,
                    isDisabled: newGeofenceRadius < 1 || !Number.isInteger(Number(newGeofenceRadius)) || newTravelTime < 1 || !Number.isInteger(Number(newTravelTime)),
                } }>
                <div className="row">
                    <div className="col">
                        <ModalAlert
                            color="danger"
                            isOpen={ newGeofenceRadius < 1 || !Number.isInteger(Number(newGeofenceRadius)) }
                            content={ <span>Geofence Radius should be positive integer</span> } />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-4 font-weight-bold">Bus Route:</div>
                    <div className="col-8">
                        {editIntersectionEntity.Bus_Route}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-4 font-weight-bold">Direction Id:</div>
                    <div className="col-8">
                        {editIntersectionEntity.Direction_Id}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-4 font-weight-bold">Site Id:</div>
                    <div className="col-8">
                        {editIntersectionEntity.Site_Id}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-4 font-weight-bold">Travel Time:</div>
                    <div className="col-8">
                        <Input
                            type="number"
                            id="intersection-travel-time"
                            value={ newTravelTime }
                            className="intersection-modal__travel-time cc-form-control"
                            placeholder="Travel Time"
                            onChange={ (event) => {
                                setNewTravelTime(event.target.value);
                            } }
                            min="1"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-4 font-weight-bold">Geofence Radius:</div>
                    <div className="col-8">
                        <Input
                            type="number"
                            id="intersection-geofence-radius"
                            value={ newGeofenceRadius }
                            className="intersection-modal__geofence-radius cc-form-control"
                            placeholder="Geofence Radius"
                            onChange={ (event) => {
                                setNewGeofenceRadius(event.target.value);
                            } }
                            min="1"
                        />
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};

BusPriorityIntersectionsDataGrid.propTypes = {
    datagridConfig: PropTypes.object.isRequired,
    busPriorityIntersections: PropTypes.array.isRequired,
    getBusPriorityIntersections: PropTypes.func.isRequired,
    updateBusPriorityIntersectionsDatagridConfig: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    updateBusPriorityIntersection: PropTypes.func.isRequired,
};

export default connect(state => ({
    busPriorityIntersections: getAllBusPriorityIntersections(state),
    datagridConfig: getBusPriorityIntersectionsDatagridConfig(state),
    isLoading: getIsLoadingBusPriorityIntersections(state),
    isEditAllowed: isBusPriorityEditAllowed(state),
}), {
    getBusPriorityIntersections, updateBusPriorityIntersectionsDatagridConfig, deleteBusPriorityRoutes, updateBusPriorityIntersection,
})(BusPriorityIntersectionsDataGrid);
