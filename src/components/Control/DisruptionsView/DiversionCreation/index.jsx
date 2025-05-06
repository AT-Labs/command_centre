import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Button, FormGroup, Input, Label } from 'reactstrap';
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
import { searchRouteVariants } from '../../../../utils/transmitters/trip-mgt-api';
import { generateUniqueColor, isAffectedStop, createAffectedStop, getUniqueStops, createModifiedRouteVariant, canMerge } from './DiversionHelper';
import { mergeCoordinates, parseWKT, toWKT } from '../../../Common/Map/RouteShapeEditor/ShapeHelper';

const CreateDiversion = (props) => {
    const SERVICE_DATE_FORMAT = 'YYYYMMDD';

    // For base route variant
    const [routeVariantsList, setRouteVariantsList] = useState([]);
    const [selectedBaseRouteVariant, setSelectedBaseRouteVariant] = useState(null);
    const [isBaseRouteVariantVisible, setIsBaseRouteVariantVisible] = useState(true);
    const [tempSelectedBaseRouteVariant, setTempSelectedBaseRouteVariant] = useState(); // Save temporarily for confirmation modal
    const [isChangeVariantModalOpen, setIsChangeVariantModalOpen] = useState(false);

    // For additional route variants
    const [baseRouteVariantOnly, setBaseRouteVariantOnly] = useState(true);
    const [secondaryRouteVariantsList, setSecondaryRouteVariantsList] = useState([]);
    const [selectedOtherRouteVariants, setSelectedOtherRouteVariants] = useState([]); // Also hold the updated shape. It is not the final payload.

    // Shared diversion shape
    const [diversionShapeWkt, setDiversionShapeWkt] = useState(null);

    // Updated base route variant
    const [modifiedBaseRouteVariant, setModifiedBaseRouteVariant] = useState();

    // Affected stops
    const [affectedStops, setAffectedStops] = useState([]);

    // Other variables
    const isSaveDisabled = () => (modifiedBaseRouteVariant?.shapeWkt?.length > 0 && diversionShapeWkt?.length > 0 && !props.creationState.isLoading) === false;
    const getUniqueAffectedStopIds = () => [...new Set(affectedStops.map(stop => stop.stopId))];

    // We only support adding diversion to bus route at the moment.
    const isBusRoute = route => route.routeType === 3;
    const [routeIds] = useState(props.disruption?.affectedEntities?.length > 0
        ? [...new Set(props.disruption?.affectedEntities.filter(isBusRoute).map(entity => entity.routeId))]
        : []);

    // Fetch available route variants to populate the dropdown lists
    const fetchVariants = async () => {
        const startDate = moment(props.disruption.startTime).format(SERVICE_DATE_FORMAT);
        const endDate = moment(props.disruption.endTime).format(SERVICE_DATE_FORMAT);
        try {
            const search = {
                page: 1,
                limit: 1000,
                routeIds,
                ...(startDate !== null && { serviceDateFrom: startDate }),
                ...(endDate !== null && { serviceDateTo: endDate }),
            };
            const response = await searchRouteVariants(search);
            setRouteVariantsList(response.routeVariants);
        } catch {
            setRouteVariantsList([]);
        }
    };

    // Drop down lists
    const handleSelectMainVariant = (variant) => {
        if (variant) {
            if (diversionShapeWkt && diversionShapeWkt.length > 0) {
                // If there are changes already
                setTempSelectedBaseRouteVariant(variant);
                setIsChangeVariantModalOpen(true);
            } else {
                setSelectedBaseRouteVariant(variant);
            }
        } else {
            // reset
            setSelectedBaseRouteVariant(null);
            setSecondaryRouteVariantsList([]);
        }
    };

    const handleSelectOtherVariant = (variant) => {
        if (variant) {
            const originalCoordinates = parseWKT(variant.shapeWkt);
            const mergedCoordinates = mergeCoordinates(originalCoordinates, parseWKT(diversionShapeWkt));
            const updatedAdditionalRouteVariants = [...selectedOtherRouteVariants, {
                ...variant,
                shapeWkt: toWKT(mergedCoordinates),
                color: generateUniqueColor(variant.routeVariantId),
                visible: true,
            }];
            setSelectedOtherRouteVariants(updatedAdditionalRouteVariants);
            setSecondaryRouteVariantsList(secondaryRouteVariantsList
                .map(v => (v.routeVariantId === variant.routeVariantId ? ({
                    ...v,
                    hidden: v.routeVariantId === variant.routeVariantId, // hide the already added one
                }) : v)));
        }
    };

    // Find affected stops when diversion shape or the list of selected other route variants are updated.
    useEffect(() => {
        if (diversionShapeWkt?.length > 0 && modifiedBaseRouteVariant) {
            let updatedAffectedStops = [];

            // Find affected Stops for the main route variants
            const highlighted = selectedBaseRouteVariant.stops
                .filter(stop => isAffectedStop(stop, modifiedBaseRouteVariant.shapeWkt))
                .map(s => createAffectedStop(s, selectedBaseRouteVariant));
            updatedAffectedStops = [...highlighted];

            // Find affected stops for the additional route variants
            selectedOtherRouteVariants.forEach((add) => {
                const routeVariant = routeVariantsList.find(r => r.routeVariantId === add.routeVariantId);
                if (routeVariant) {
                    const additionalStops = routeVariant.stops
                        .filter(stop => isAffectedStop(stop, add.shapeWkt))
                        .map(s => createAffectedStop(s, routeVariant));
                    updatedAffectedStops = [...updatedAffectedStops, ...additionalStops];
                }
            });

            const uniqueUpdatedAffectedStops = getUniqueStops(updatedAffectedStops);
            setAffectedStops(uniqueUpdatedAffectedStops);
        } else {
            setAffectedStops([]);
        }
    }, [diversionShapeWkt, selectedOtherRouteVariants]);

    // Fetch route variants when the component mounts
    useEffect(() => {
        if (routeIds.length > 0) {
            fetchVariants();
        }
    }, [routeIds]);

    // Handel the shape updated events triggered by the shape editor
    const onShapeUpdated = (updatedDiversionShape, updatedRouteVariantShape) => {
        setDiversionShapeWkt(updatedDiversionShape);

        if (selectedBaseRouteVariant?.routeVariantId && updatedRouteVariantShape && updatedDiversionShape) {
            setModifiedBaseRouteVariant(createModifiedRouteVariant(selectedBaseRouteVariant, updatedRouteVariantShape));
            // Merge into other selected route variants
            const updatedOtherRouteVariants = selectedOtherRouteVariants.map((rv) => {
                const originalRouteVariant = routeVariantsList.find(x => x.routeVariantId === rv.routeVariantId);
                if (originalRouteVariant) {
                    const originalCoordinates = parseWKT(originalRouteVariant.shapeWkt);
                    const mergedCoordinates = mergeCoordinates(originalCoordinates, parseWKT(updatedDiversionShape));
                    return { ...rv, shapeWkt: toWKT(mergedCoordinates) };
                }
                return rv;
            });
            setSelectedOtherRouteVariants(updatedOtherRouteVariants);
        }
    };

    const reset = () => {
        setSelectedBaseRouteVariant(null);
        setTempSelectedBaseRouteVariant(null);
        setAffectedStops([]);
        setDiversionShapeWkt(null);
        setModifiedBaseRouteVariant(null);
    };

    // Buttons
    const onCancelClicked = () => {
        if (props.onCancelled) {
            props.onCancelled();
        }
    };

    const onSaveClicked = async () => {
        if (modifiedBaseRouteVariant && diversionShapeWkt) {
            let modifiedOtherRouteVariants = [];
            if (selectedOtherRouteVariants.length > 0) {
                modifiedOtherRouteVariants = selectedOtherRouteVariants
                    .map(rv => createModifiedRouteVariant(rv, rv.shapeWkt));
            }
            props.createDiversion({
                disruptionId: Number(props.disruption.disruptionId),
                diversionShapeWkt,
                routeVariants: [
                    modifiedBaseRouteVariant,
                    ...modifiedOtherRouteVariants,
                ],
                affectedStops,
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

    const handleOtherVisibilityChange = (routeVariantId) => {
        setSelectedOtherRouteVariants(prevVariants => prevVariants.map(variant => (variant.routeVariantId === routeVariantId
            ? { ...variant, visible: !variant.visible }
            : variant)));
    };

    const handleMainVisibilityChange = () => {
        setIsBaseRouteVariantVisible(!isBaseRouteVariantVisible);
    };

    const handleOnlyOneRouteVariantCB = (checked) => {
        setBaseRouteVariantOnly(checked);
        if (checked) {
            setSecondaryRouteVariantsList([]);
            setSelectedOtherRouteVariants([]);
        } else {
            const updatedSecondaryList = routeVariantsList.map(v => ({
                ...v,
                hidden: v.routeVariantId === selectedBaseRouteVariant.routeVariantId
                    || v.directionId !== selectedBaseRouteVariant.directionId
                    || !canMerge(v.shapeWkt, diversionShapeWkt),
            }));
            setSecondaryRouteVariantsList(updatedSecondaryList);
        }
    };

    const handleRemoveRouteVariant = (routeVariantId) => {
        // Remove the route variant from additionalRouteVariants
        const updatedAdditionalRouteVariants = selectedOtherRouteVariants.filter(
            variant => variant.routeVariantId !== routeVariantId,
        );
        setSelectedOtherRouteVariants(updatedAdditionalRouteVariants);

        // Unhide the route variant in secondaryRouteVariantsList
        setSecondaryRouteVariantsList(
            secondaryRouteVariantsList.map(variant => (variant.routeVariantId === routeVariantId
                ? { ...variant, hidden: false }
                : variant)),
        );
    };

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
                    <div className="select-main-variant-container  pl-4 pr-1">
                        <p>Select the first route variant to define a diversion</p>
                        <div style={ { display: 'flex', alignItems: 'center', gap: '10px' } }>
                            <div className="route-variant-select">
                                <RouteVariantSelect
                                    disabled={ !baseRouteVariantOnly }
                                    routeVariants={ routeVariantsList }
                                    selectedRouteVariant={ selectedBaseRouteVariant }
                                    onSelectVariant={ handleSelectMainVariant }
                                />
                            </div>

                            <FormGroup check>
                                <Label check>
                                    <Input
                                        id="add-diversion-main"
                                        type="checkbox"
                                        className="mr-2"
                                        onChange={ () => handleMainVisibilityChange() }
                                        size={ 20 }
                                        disabled={ selectedBaseRouteVariant === null }
                                        checked={ isBaseRouteVariantVisible } />
                                    <span>View</span>
                                </Label>
                            </FormGroup>
                        </div>
                    </div>
                    <div className="select-multiple-variants-container pl-4 pr-1">
                        <FormGroup check>
                            <Label check>
                                <Input
                                    id="add-diversion-cb"
                                    type="checkbox"
                                    className="mr-2"
                                    disabled={ selectedBaseRouteVariant === null || diversionShapeWkt === null || diversionShapeWkt.length < 1 }
                                    onChange={ (e) => { handleOnlyOneRouteVariantCB(e.target.checked); } }
                                    size={ 20 }
                                    checked={ baseRouteVariantOnly } />
                                <span>Apply diversion only to one route variant</span>
                            </Label>
                        </FormGroup>
                        { !baseRouteVariantOnly
                        && (
                            <div>
                                <p>
                                    <b>Select the other route variant(s) to apply the defined diversion</b>
                                </p>
                                <div className="route-variant-select">
                                    <RouteVariantSelect
                                        label="Select another route variant"
                                        className="route-variant-select"
                                        routeVariants={ secondaryRouteVariantsList }
                                        onSelectVariant={ handleSelectOtherVariant }
                                    />
                                </div>
                                {selectedOtherRouteVariants.map(routeVariant => (
                                    <div className="other-route-variant-container" key={ routeVariant.routeVariantId }>
                                        <span className="other-route-variant-text">
                                            { `${routeVariant.routeVariantId} - ${routeVariant.routeLongName}` }
                                        </span>
                                        <FormGroup check>
                                            <Label check>
                                                <Input
                                                    id={ `add-diversion-rv-${routeVariant.routeVariantId}` }
                                                    type="checkbox"
                                                    className="mr-2"
                                                    onChange={ () => handleOtherVisibilityChange(routeVariant.routeVariantId) }
                                                    size={ 20 }
                                                    checked={ routeVariant.visible } />
                                                <span style={ { color: routeVariant.color } }>View</span>
                                            </Label>
                                            <Button
                                                color="link"
                                                style={ { marginLeft: '20px', padding: 0 } }
                                                onClick={ () => handleRemoveRouteVariant(routeVariant.routeVariantId) }
                                            >
                                                Remove
                                            </Button>
                                        </FormGroup>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="pl-4 pr-4">
                        <p>
                            <b>Stops affected</b>
                        </p>
                        {affectedStops.length > 0 ? (
                            affectedStops.map(stop => (
                                <div key={ stop.stopCode }>
                                    <span>
                                        { `${stop.stopCode} - ${stop.stopName} (${stop.routeShortName})` }
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
            <RouteShapeEditor
                routeVariant={ selectedBaseRouteVariant }
                additionalRouteVariants={ selectedOtherRouteVariants }
                highlightedStops={ getUniqueAffectedStopIds() }
                onShapeUpdated={ onShapeUpdated }
                visible={ isBaseRouteVariantVisible }
                className="map" />
            <CustomModal
                className="change-selected-route-variant-modal"
                title="Change Selected Route Variant"
                isModalOpen={ isChangeVariantModalOpen }>
                <ChangeSelectedRouteVariantModal
                    onConfirmation={ () => {
                        setSelectedBaseRouteVariant(tempSelectedBaseRouteVariant);
                        setIsChangeVariantModalOpen(false);
                    } }
                    onCancel={ () => setIsChangeVariantModalOpen(false) }
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
