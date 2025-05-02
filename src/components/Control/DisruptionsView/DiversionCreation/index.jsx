import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Button } from 'reactstrap';
import '../../../Common/OffCanvasLayout/OffCanvasLayout.scss';
import './styles.scss';
import SidePanel from '../../../Common/OffCanvasLayout/SidePanel/SidePanel';
import RouteVariantSelect from './RouteVariantSelect';
import RouteShapeEditor from '../../../Common/Map/RouteShapeEditor/RouteShapeEditor';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ChangeSelectedRouteVariantModal from './ChangeSelectedRouteVariantModal';
import CreateDiversionResultModal, { ACTION_TYPE } from './CreateDiversionResultModal';
import { createDiversion, resetDiversionCreation } from '../../../../redux/actions/control/diversions';
import { getDiversionCreationState } from '../../../../redux/selectors/control/diversions';

const CreateDiversion = (props) => {
    const SERVICE_DATE_FORMAT = 'YYYYMMDD';
    const [selectedRouteVariant, setSelectedRouteVariant] = useState();
    const [temporarySelectedRouteVariant, setTemporarySelectedRouteVariant] = useState(); // save temporarily for confirmation modal
    const [affectedStops, setAffectedStops] = useState([]);
    const [diversionShapeWkt, setDiversionShapeWkt] = useState();
    const [updatedRouteVariant, setUpdatedRouteVariant] = useState();
    const [isChangeSelectionModalOpen, setIsChangeSelectionModalOpen] = useState(false);

    const handleSelectVariant = (variant) => {
        if (variant) {
            if (diversionShapeWkt && diversionShapeWkt.length > 0) {
                // If there are changes already
                setTemporarySelectedRouteVariant(variant);
                setIsChangeSelectionModalOpen(true);
            } else {
                setSelectedRouteVariant(variant);
            }
        } else {
            // reset
            setSelectedRouteVariant(null);
        }
    };

    const onShapeUpdated = (updatedDiversionShape, updatedRouteVariantShape, stops) => {
        setDiversionShapeWkt(updatedDiversionShape);
        setAffectedStops(stops);
        if (selectedRouteVariant?.routeVariantId && updatedRouteVariantShape && updatedDiversionShape) {
            setUpdatedRouteVariant({
                routeVariantId: Number(selectedRouteVariant.routeVariantId),
                routeId: selectedRouteVariant.routeId,
                routeVariantName: selectedRouteVariant.routeLongName,
                direction: selectedRouteVariant.directionId,
                shapeWkt: updatedRouteVariantShape,
            });
        }
    };

    const onCancelClicked = () => {
        if (props.onCancelled) {
            props.onCancelled();
        }
    };

    const reset = () => {
        setSelectedRouteVariant(null);
        setTemporarySelectedRouteVariant(null);
        setAffectedStops([]);
        setDiversionShapeWkt(null);
        setUpdatedRouteVariant(null);
    };

    const onSaveClicked = async () => {
        if (updatedRouteVariant && diversionShapeWkt) {
            props.createDiversion({
                disruptionId: Number(props.disruption.disruptionId),
                diversionShapeWkt,
                routeVariants: [
                    updatedRouteVariant,
                ],
            });
        }
    };

    const handleResultAction = (action) => {
        props.resetDiversionCreation();
        if (action === ACTION_TYPE.NEW_DIVERSION) {
            reset();
        } else if (action === ACTION_TYPE.RETURN_TO_DISRUPTION) {
            if (props.onCancelled) {
                props.onCancelled();
            }
        }
    };

    const isSaveDisabled = () => (updatedRouteVariant?.shapeWkt?.length > 0 && diversionShapeWkt?.length > 0 && !props.creationState.isLoading) === false;

    // We only support adding diversion to bus route at the moment.
    const isBusRoute = route => route.routeType === 3;

    const routeIds = props.disruption?.affectedEntities?.length > 0 ? [...new Set(props.disruption?.affectedEntities.filter(isBusRoute).map(entity => entity.routeId))] : [];

    return (
        <div className="side-panel-control-component-view d-flex">
            <SidePanel
                isOpen
                isActive
                className="side-panel-primary-panel side-panel__scroll-size"
                toggleButton={ false }
            >
                <div className="diversion-creation-container">
                    <h2 className="pl-4 pr-4">Add Diversion</h2>
                    <div className="select-variant-container  pl-4 pr-4">
                        <b>Select the first route variant to define a diversion</b>
                        <p>Only one route variant can be selected</p>
                        <RouteVariantSelect
                            routeIds={ routeIds }
                            startDate={ moment(props.disruption.startTime).format(SERVICE_DATE_FORMAT) }
                            endDate={ moment(props.disruption.endTime).format(SERVICE_DATE_FORMAT) }
                            selectedRouteVariant={ selectedRouteVariant }
                            onSelectVariant={ handleSelectVariant }
                        />
                    </div>
                    <div className="pl-4 pr-4">
                        <p>
                            <b>Stops affected</b>
                        </p>
                        {affectedStops.length > 0 ? (
                            affectedStops.map(stop => (
                                <div key={ stop.stopCode }>
                                    <span>
                                        {stop.stopCode}
                                        {' - '}
                                        {stop.stopName}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p>No stops affected</p>
                        )}
                    </div>
                    <footer className="row m-0 justify-content-between p-4 position-fixed">
                        <div className="col-4 pl-0">
                            <Button className="btn cc-btn-secondary btn-block pl-0" onClick={ onCancelClicked }>
                                Cancel
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button
                                className="btn cc-btn-primary btn-block continue"
                                onClick={ onSaveClicked }
                                disabled={ isSaveDisabled() }
                            >
                                Save Diversion
                            </Button>
                        </div>
                    </footer>
                </div>
            </SidePanel>
            <RouteShapeEditor routeVariant={ selectedRouteVariant } onShapeUpdated={ onShapeUpdated } className="map" />
            <CustomModal
                className="change-selected-route-variant-modal"
                title="Change Selected Route Variant"
                isModalOpen={ isChangeSelectionModalOpen }>
                <ChangeSelectedRouteVariantModal
                    onConfirmation={ () => {
                        setSelectedRouteVariant(temporarySelectedRouteVariant);
                        setIsChangeSelectionModalOpen(false);
                    } }
                    onCancel={ () => setIsChangeSelectionModalOpen(false) }
                />
            </CustomModal>
            <CustomModal
                className="create-diversion-result-modal"
                title="Add Diversion"
                isModalOpen={ props.creationState?.diversionId || props.creationState?.error }>
                <CreateDiversionResultModal
                    result={ props.creationState?.diversionId ? `Diversion #${props.creationState?.diversionId} has been saved to disruption.` : null }
                    error={ props.creationState?.error?.message }
                    onAction={ handleResultAction }
                />
            </CustomModal>
        </div>
    );
};

CreateDiversion.propTypes = {
    createDiversion: PropTypes.func.isRequired,
    resetDiversionCreation: PropTypes.func.isRequired,
    disruption: PropTypes.object,
    onCancelled: PropTypes.func,
    creationState: PropTypes.object,
};

CreateDiversion.defaultProps = {
    disruption: null,
    onCancelled: null,
    creationState: {
        isLoading: false,
        diversionId: null,
        error: null,
    },
};

export default connect(state => ({
    creationState: getDiversionCreationState(state),
}), { createDiversion, resetDiversionCreation })(CreateDiversion);
