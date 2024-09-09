import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty, size } from 'lodash-es';
import { GridFooterContainer, GridFooter } from '@mui/x-data-grid-pro';
import { FaPlus } from 'react-icons/fa';
import { FormGroup, Label, Button, Input } from 'reactstrap';
import CustomDataGrid from '../../../Common/CustomDataGrid/CustomDataGrid';
import { getAllBusPriorityRoutes, getBusPriorityRoutesDatagridConfig,
    getIsLoadingBusPriorityRoutes, isBusPriorityEditAllowed } from '../../../../redux/selectors/control/dataManagement/busPriority';
import { deleteBusPriorityRoutes, getBusPriorityRoutes, updateBusPriorityRoutesDatagridConfig, addBusPriorityRoute } from '../../../../redux/actions/control/dataManagement';
import BusPriorityFooter from './BusPriorityFooter';
import ConfirmationModal from '../../Common/ConfirmationModal/ConfirmationModal';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ModalAlert from '../../BlocksView/BlockModals/ModalAlert';

export const LABEL_PARTITION_KEY = 'Partition Key';
export const LABEL_ROW_KEY = 'Row Key';
export const LABEL_TIMESTAMP = 'Timestamp';
export const LABEL_ROUTE = 'Route';

export const BusPriorityRoutesDataGrid = (props) => {
    const confirmationModalTypes = {
        NONE: 'none',
        DELETE_SELECTED_ROUTES: 'resetSelectedEntities',
    };

    const [selectedRow, setSelectedRow] = React.useState([]);
    const [confirmationModalType, setConfirmationModalType] = useState(confirmationModalTypes.NONE);
    const [newRouteId, setNewRouteId] = useState('');
    const [isNewRouteModalOpen, setIsNewRouteModalOpen] = useState(false);
    const [isNewRouteValid, setIsNewRouteValid] = useState(false);

    useEffect(() => {
        props.getBusPriorityRoutes();
    }, []);

    const deselectAllItems = () => {
        setSelectedRow([]);
    };

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
            field: 'route',
            headerName: LABEL_ROUTE,
            width: 150,
            type: 'string',
        },
    ];

    const confirmationModalProps = {
        [confirmationModalTypes.NONE]: {
            title: '',
            message: '',
            isOpen: false,
            onClose: () => { setConfirmationModalType(confirmationModalTypes.NONE); },
            onAction: () => { setConfirmationModalType(confirmationModalTypes.NONE); },
        },
        [confirmationModalTypes.DELETE_SELECTED_ROUTES]: {
            title: 'Delete Routes',
            message: 'The selected routes will be deleted, do you wish to continue?',
            isOpen: true,
            onClose: () => { setConfirmationModalType(confirmationModalTypes.NONE); },
            onAction: () => {
                props.deleteBusPriorityRoutes(selectedRow);
                deselectAllItems();
                setConfirmationModalType(confirmationModalTypes.NONE);
            },
        },
    };

    const activeConfirmationModalProps = confirmationModalProps[confirmationModalType];

    const openDeleteModalforCheckBox = (selected) => {
        if (selected) {
            setConfirmationModalType(confirmationModalTypes.DELETE_SELECTED_ROUTES);
        }
    };

    const renderCustomFooter = () => (
        <GridFooterContainer>
            <BusPriorityFooter
                selectedRow={ selectedRow }
                deselectAllItems={ () => deselectAllItems() }
                onClick={ () => openDeleteModalforCheckBox(selectedRow) }
            />
            <GridFooter />
        </GridFooterContainer>
    );

    const addNewRoute = () => {
        props.addBusPriorityRoute(newRouteId);

        setIsNewRouteModalOpen(false);
        setNewRouteId('');
    };

    const handleNewRouteIdChange = (event) => {
        setNewRouteId(event.target.value.toUpperCase());
        setIsNewRouteValid(!props.busPriorityRoutes.some(route => route.route === event.target.value.toUpperCase()));
    };

    return (
        <div>
            {
                props.isEditAllowed && (
                    <div className="row pb-2">
                        <div className="col-9 d-flex justify-content-between">
                            <Button
                                className="cc-btn-secondary"
                                onClick={ () => setIsNewRouteModalOpen(true) }>
                                <FaPlus size={ 20 } className="cc-btn-secondary__icon" />
                                Add Routes
                            </Button>
                        </div>
                    </div>
                )
            }
            <CustomDataGrid
                gridClassNames="vh-70"
                loading={ props.isLoading }
                columns={ GRID_COLUMNS }
                datagridConfig={ props.datagridConfig }
                dataSource={ props.busPriorityRoutes }
                updateDatagridConfig={ config => props.updateBusPriorityRoutesDatagridConfig(config) }
                getRowId={ row => row.rowKey }
                checkboxSelection={ props.isEditAllowed }
                selectionModel={ selectedRow }
                onChangeSelectedData={ x => setSelectedRow([...x]) }
                customFooter={ size(selectedRow) > 0 ? renderCustomFooter : undefined }
            />
            <ConfirmationModal
                title={ activeConfirmationModalProps.title }
                message={ activeConfirmationModalProps.message }
                isOpen={ activeConfirmationModalProps.isOpen }
                onClose={ activeConfirmationModalProps.onClose }
                onAction={ activeConfirmationModalProps.onAction } />
            <CustomModal
                title="Add new route"
                isModalOpen={ isNewRouteModalOpen }
                onClose={ () => {
                    setIsNewRouteModalOpen(false);
                    setNewRouteId('');
                } }
                okButton={ {
                    label: 'Add new route',
                    onClick: addNewRoute,
                    isDisabled: isEmpty(newRouteId) || !isNewRouteValid,
                } }>
                <div className="row">
                    <div className="col">
                        <ModalAlert
                            color="danger"
                            isOpen={ !isEmpty(newRouteId) && !isNewRouteValid }
                            content={ <span>Route already exists</span> } />
                    </div>
                </div>
                <FormGroup>
                    <Label for="routeId">Route Number</Label>
                    <Input
                        type="text"
                        id="routeId"
                        placeholder="Enter route id"
                        maxLength="10"
                        value={ newRouteId }
                        onChange={ handleNewRouteIdChange } />
                </FormGroup>
            </CustomModal>
        </div>
    );
};

BusPriorityRoutesDataGrid.propTypes = {
    datagridConfig: PropTypes.object.isRequired,
    busPriorityRoutes: PropTypes.array.isRequired,
    getBusPriorityRoutes: PropTypes.func.isRequired,
    updateBusPriorityRoutesDatagridConfig: PropTypes.func.isRequired,
    deleteBusPriorityRoutes: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    addBusPriorityRoute: PropTypes.func.isRequired,
    isEditAllowed: PropTypes.bool.isRequired,
};

export default connect(state => ({
    busPriorityRoutes: getAllBusPriorityRoutes(state),
    datagridConfig: getBusPriorityRoutesDatagridConfig(state),
    isLoading: getIsLoadingBusPriorityRoutes(state),
    isEditAllowed: isBusPriorityEditAllowed(state),
}), {
    getBusPriorityRoutes, updateBusPriorityRoutesDatagridConfig, deleteBusPriorityRoutes, addBusPriorityRoute,
})(BusPriorityRoutesDataGrid);
