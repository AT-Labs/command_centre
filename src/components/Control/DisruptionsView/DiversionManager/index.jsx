import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import { debounce } from 'lodash-es';
import '../../../Common/OffCanvasLayout/OffCanvasLayout.scss';
import './styles.scss';
import SidePanel from '../../../Common/OffCanvasLayout/SidePanel/SidePanel';
import RouteShapeEditor from '../../../Common/Map/RouteShapeEditor/RouteShapeEditor';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ChangeSelectedRouteVariantModal from './ChangeSelectedRouteVariantModal';
import DiversionResultModal, { ACTION_TYPE } from './DiversionResultModal';
import { createDiversion, updateDiversion, resetDiversionResult } from '../../../../redux/actions/control/diversions';
import { getDiversionResultState, getDiversionForEditing, getDiversionEditMode } from '../../../../redux/selectors/control/diversions';
import { useDiversion } from '../../../../redux/selectors/appSettings';
import { searchRouteVariants } from '../../../../utils/transmitters/trip-mgt-api';
import { isAffectedStop, createAffectedStop,
    getUniqueStops, createModifiedRouteVariant, canMerge, hasDiversionModified, getUniqueAffectedStopIds,
    mergeDiversionToRouteVariant, removeDuplicatePoints } from './DiversionHelper';
import { mergeCoordinates, parseWKT, toWKT } from '../../../Common/Map/RouteShapeEditor/ShapeHelper';
import dateTypes from '../../../../types/date-types';
import EDIT_TYPE from '../../../../types/edit-types';
import { BUS_TYPE_ID } from '../../../../types/vehicle-types';
import { getAffectedEntities } from '../../../../utils/control/diversions';
import BaseRouteVariantSelector from './BaseRouteVariantSelector';
import AdditionalRouteVariantSelector from './AdditionalRouteVariantSelector';
import AffectedStops from './AffectedStops';

const DiversionManager = (props) => {
    const SERVICE_DATE_FORMAT = 'YYYYMMDD';
    const TIME_FORMAT_HHMM = 'HH:mm';
    const debounceDelay = 300;
    const isEditingMode = props.editMode === EDIT_TYPE.EDIT;
    const title = `${isEditingMode ? 'Edit' : 'Add'} Diversion`;
    const resultAction = isEditingMode ? 'updated' : 'added';
    const buttonText = `${isEditingMode ? 'Update' : 'Create'} Diversion`;
    const editingDiversions = props.diversion?.diversionRouteVariants || [];

    // For base route variant
    const [routeVariantsList, setRouteVariantsList] = useState([]);
    const [selectedBaseRouteVariant, setSelectedBaseRouteVariant] = useState(null);
    const [initialBaseRouteShape, setInitialBaseRouteShape] = useState(null);
    const [isBaseRouteVariantVisible, setIsBaseRouteVariantVisible] = useState(true);
    const [tempSelectedBaseRouteVariant, setTempSelectedBaseRouteVariant] = useState(); // Save temporarily for confirmation modal
    const [isChangeVariantModalOpen, setIsChangeVariantModalOpen] = useState(false);

    // For additional route variants
    const [baseRouteVariantOnly, setBaseRouteVariantOnly] = useState(true);
    const [secondaryRouteVariantsList, setSecondaryRouteVariantsList] = useState([]);
    const [selectedOtherRouteVariants, setSelectedOtherRouteVariants] = useState([]); // Also hold the updated shape. It is not the final payload.

    // Shared diversion shape
    const [diversionShapeWkt, setDiversionShapeWkt] = useState(isEditingMode && props.diversion ? props.diversion.diversionShapeWkt : null);

    // Updated base route variant
    const [modifiedBaseRouteVariant, setModifiedBaseRouteVariant] = useState();

    // Affected stops
    const [affectedStops, setAffectedStops] = useState([]);

    // Other variables
    const isDiversionValid = modifiedBaseRouteVariant?.shapeWkt?.length > 0 && diversionShapeWkt?.length > 0;
    const [isUpdated, setIsUpdated] = useState(false);

    // We only support adding diversion to bus route at the moment.
    const isBusRoute = route => route.routeType === BUS_TYPE_ID;
    const [routeIds, setRouteIds] = useState([]);
    // Recalculate routeIds when disruption changes
    useEffect(() => {
        const entities = getAffectedEntities(props.disruption);
        const busEntities = entities.filter(isBusRoute);
        const ids = entities.length > 0
            ? [...new Set(busEntities.map(entity => entity.routeId))]
            : [];
        setRouteIds(ids);
    }, [props.disruption]);

    const initEditingMode = (routeVariants) => {
        // Select the base route in edit mode
        const baseRouteVariantId = props.diversion.diversionRouteVariants[0].routeVariantId;
        const baseRouteVariant = routeVariants.find(rv => rv.routeVariantId === baseRouteVariantId);
        if (baseRouteVariant) {
            setSelectedBaseRouteVariant(baseRouteVariant);
            const initialCoordinates = isEditingMode ? mergeCoordinates(
                parseWKT(baseRouteVariant.shapeWkt),
                parseWKT(props.diversion.diversionShapeWkt),
            ) : [];
            setInitialBaseRouteShape(toWKT(initialCoordinates));
        } else {
            return;
        }

        // set the selected route variants
        const selectedRouteVariants = routeVariants.filter(rv => editingDiversions.some(ed => ed.routeVariantId === rv.routeVariantId));
        const updatedSelectedRouteVariants = selectedRouteVariants.filter(v => v.routeVariantId !== baseRouteVariantId)
            .map(rv => mergeDiversionToRouteVariant(rv, rv.shapeWkt, props.diversion.diversionShapeWkt));

        setBaseRouteVariantOnly(selectedRouteVariants.length === 1);
        setSecondaryRouteVariantsList(routeVariants
            .filter(rv => rv.routeVariantId !== baseRouteVariantId
                                && rv.directionId === baseRouteVariant.directionId
                                && canMerge(rv.shapeWkt, diversionShapeWkt))
            .map(rv => ({
                ...rv,
                hidden: selectedRouteVariants.some(srv => srv.routeVariantId === rv.routeVariantId),
            })));
        setSelectedOtherRouteVariants(updatedSelectedRouteVariants);
    };

    // Fetch available route variants to populate the dropdown lists
    const fetchVariants = debounce(async () => {
        const start = moment(props.disruption.startTime).tz(dateTypes.TIME_ZONE);
        const end = props.disruption.endTime ? moment(props.disruption.endTime).tz(dateTypes.TIME_ZONE) : null;
        const startDate = start.format(SERVICE_DATE_FORMAT);
        const startTime = start.format(TIME_FORMAT_HHMM);
        const endDate = end ? end.format(SERVICE_DATE_FORMAT) : null;
        const endTime = end ? end.format(TIME_FORMAT_HHMM) : null;
        try {
            const search = {
                page: 1,
                limit: 1000,
                routeIds,
                ...(startDate && { serviceDateFrom: startDate }),
                ...(startTime && { startTime }),
                ...(endDate && { serviceDateTo: endDate }),
                ...(endTime && { endTime }),
            };
            let { routeVariants } = await searchRouteVariants(search);
            if (routeVariants?.length > 0) {
                // Remove duplicate points around bus stops in the shapeWkt
                routeVariants = routeVariants.map(rv => ({ ...rv, shapeWkt: removeDuplicatePoints(rv.shapeWkt) }));
            }
            setRouteVariantsList(routeVariants);
            if (isEditingMode && routeVariants && props.diversion) {
                props.diversion.diversionRouteVariants.forEach((rv) => {
                    const existingVariant = routeVariants.find(r => r.routeVariantId === rv.routeVariantId);
                    if (existingVariant) {
                        // override hasTripModifications for the existing route variants in editing mode.
                        // They should be able to be removed and added again.
                        existingVariant.hasTripModifications = false;
                    }
                });
                // Restore state for editing mode
                initEditingMode(routeVariants);
            }
        } catch {
            setRouteVariantsList([]);
        }
    }, debounceDelay);

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
            const updatedAdditionalRouteVariants = [...selectedOtherRouteVariants, mergeDiversionToRouteVariant(variant, variant.shapeWkt, diversionShapeWkt)];
            setSelectedOtherRouteVariants(updatedAdditionalRouteVariants);
            setSecondaryRouteVariantsList(secondaryRouteVariantsList
                .map(v => (v.routeVariantId === variant.routeVariantId ? ({
                    ...v,
                    hidden: v.routeVariantId === variant.routeVariantId, // hide the already added one
                }) : v)));
        }
    };

    useEffect(() => {
        // Find affected stops when diversion shape or the list of selected other route variants are updated.
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

        if (isEditingMode) {
            // Check if the diversion has been modified
            const isModified = hasDiversionModified({
                isEditingMode,
                diversionShapeWkt,
                originalDiversionShapeWkt: props.diversion ? props.diversion.diversionShapeWkt : null,
                selectedOtherRouteVariants,
                editingDiversions,
            });
            setIsUpdated(isModified);
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
                    return mergeDiversionToRouteVariant(rv, originalRouteVariant.shapeWkt, updatedDiversionShape);
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
        setSelectedOtherRouteVariants([]);
        setBaseRouteVariantOnly(true);
        fetchVariants();
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

            const diversionPayload = {
                disruptionId: Number(props.disruption.disruptionId),
                diversionShapeWkt,
                routeVariants: [
                    modifiedBaseRouteVariant,
                    ...modifiedOtherRouteVariants,
                ],
                affectedStops,
            };

            if (isEditingMode) {
                props.updateDiversion({
                    ...diversionPayload,
                    diversionId: props.diversion.diversionId,
                });
            } else {
                props.createDiversion(diversionPayload);
            }
        }
    };

    const handleResultAction = (action) => {
        props.resetDiversionResult();
        if (action === ACTION_TYPE.NEW_DIVERSION) {
            reset();
        } else if (action === ACTION_TYPE.RETURN_TO_DIVERSION) {
            // Do nothing - keep the form state
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
            // Automatically select all available route variants that has no trip modifications and can be merged
            const availableRouteVariants = updatedSecondaryList.filter(v => !v.hasTripModifications && !v.hidden);
            if (availableRouteVariants.length > 0) {
                const updatedSelectedOtherRouteVariants = availableRouteVariants.map(rv => mergeDiversionToRouteVariant(rv, rv.shapeWkt, diversionShapeWkt));
                setSelectedOtherRouteVariants(updatedSelectedOtherRouteVariants);
                setSecondaryRouteVariantsList(updatedSecondaryList.map(v => ({
                    ...v,
                    hidden: availableRouteVariants
                        .some(rv => rv.routeVariantId === v.routeVariantId) ? true : v.hidden, // Hide all as we automatically select all available route variants
                })));
            } else {
                setSelectedOtherRouteVariants([]);
                setSecondaryRouteVariantsList(updatedSecondaryList);
            }
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

    const containerClassName = `side-panel-control-component-view d-flex${props.useDiversion ? ' use-diversion-enabled' : ''}`;

    return (
        <div className={ containerClassName }>
            <SidePanel
                isOpen
                isActive
                className="side-panel-primary-panel side-panel__scroll-size"
                toggleButton={ false }
            >
                <div className="diversion-creation-container">
                    <h2 className="pl-4 pr-4">{ title }</h2>
                    <BaseRouteVariantSelector
                        disabled={ !baseRouteVariantOnly || props.editMode === EDIT_TYPE.EDIT }
                        editMode={ props.editMode }
                        routeVariantsList={ routeVariantsList }
                        selectedRouteVariant={ selectedBaseRouteVariant }
                        onSelectVariant={ handleSelectMainVariant }
                        visibility={ isBaseRouteVariantVisible }
                        onVisibilityChanged={ handleMainVisibilityChange }
                    />
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
                        { !baseRouteVariantOnly && (
                            <AdditionalRouteVariantSelector
                                routeVariantsList={ secondaryRouteVariantsList }
                                selectedRouteVariants={ selectedOtherRouteVariants }
                                onSelectVariant={ handleSelectOtherVariant }
                                onVisibilityChange={ handleOtherVisibilityChange }
                                onRouteVariantRemoved={ handleRemoveRouteVariant }
                            />
                        ) }
                    </div>
                    <AffectedStops affectedStops={ affectedStops } />
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
                                disabled={ (isEditingMode && !isUpdated) || !isDiversionValid || props.resultState.isLoading }
                            >
                                { buttonText }
                            </Button>
                        </div>
                    </footer>
                </div>
            </SidePanel>
            <RouteShapeEditor
                routeVariant={ selectedBaseRouteVariant }
                initialShape={ initialBaseRouteShape }
                additionalRouteVariants={ selectedOtherRouteVariants }
                highlightedStops={ getUniqueAffectedStopIds(affectedStops) }
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
                className="diversion-result-modal"
                title={ title }
                isModalOpen={ !props.resultState.isLoading && (props.resultState?.diversionId || props.resultState?.error) }>
                <DiversionResultModal
                    showNewDiversionButton={ !isEditingMode }
                    result={ props.resultState?.diversionId ? `Diversion #${props.resultState?.diversionId} has been ${resultAction}.` : null }
                    error={ props.resultState?.error?.message }
                    onAction={ handleResultAction }
                />
            </CustomModal>
        </div>
    );
};

DiversionManager.propTypes = {
    editMode: PropTypes.string.isRequired,
    createDiversion: PropTypes.func.isRequired,
    updateDiversion: PropTypes.func.isRequired,
    resetDiversionResult: PropTypes.func.isRequired,
    disruption: PropTypes.object,
    onCancelled: PropTypes.func,
    resultState: PropTypes.object,
    diversion: PropTypes.object,
    useDiversion: PropTypes.bool.isRequired,
};

DiversionManager.defaultProps = {
    disruption: null,
    onCancelled: null,
    resultState: {
        isLoading: false,
        diversionId: null,
        error: null,
    },
    diversion: null,
};

export default connect(state => ({
    editMode: getDiversionEditMode(state),
    resultState: getDiversionResultState(state),
    diversion: getDiversionForEditing(state),
    useDiversion: useDiversion(state),
}), { createDiversion, updateDiversion, resetDiversionResult })(DiversionManager);
