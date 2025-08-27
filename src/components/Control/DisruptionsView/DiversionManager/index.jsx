import React, { useEffect, useState, useCallback } from 'react';
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
import { createDiversion, updateDiversion, resetDiversionResult, fetchDiversions, clearDiversionsCache } from '../../../../redux/actions/control/diversions';
import { getDiversionResultState, getDiversionForEditing, getDiversionEditMode, getDiversionsForDisruption, getDiversionsLoadingForDisruption } from '../../../../redux/selectors/control/diversions';

import { getDiversion } from '../../../../utils/transmitters/disruption-mgt-api';
import { searchRouteVariants } from '../../../../utils/transmitters/trip-mgt-api';
import { isAffectedStop, createAffectedStop,
    getUniqueStops, createModifiedRouteVariant, canMerge, hasDiversionModified, getUniqueAffectedStopIds,
    mergeDiversionToRouteVariant, removeDuplicatePoints } from './DiversionHelper';
import { mergeCoordinates, parseWKT, toWKT } from '../../../Common/Map/RouteShapeEditor/ShapeHelper';
import dateTypes from '../../../../types/date-types';
import EDIT_TYPE from '../../../../types/edit-types';
import { BUS_TYPE_ID } from '../../../../types/vehicle-types';
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

    const [routeVariantsList, setRouteVariantsList] = useState([]);
    const [selectedBaseRouteVariant, setSelectedBaseRouteVariant] = useState(null);
    const [initialBaseRouteShape, setInitialBaseRouteShape] = useState(null);
    const [isBaseRouteVariantVisible, setIsBaseRouteVariantVisible] = useState(true);
    const [tempSelectedBaseRouteVariant, setTempSelectedBaseRouteVariant] = useState();
    const [isChangeVariantModalOpen, setIsChangeVariantModalOpen] = useState(false);

    const existingDiversions = getDiversionsForDisruption(props.disruption?.disruptionId || props.disruption?.incidentId)(props.state) || [];
    const isLoadingExistingDiversions = getDiversionsLoadingForDisruption(props.disruption?.disruptionId || props.disruption?.incidentId)(props.state) || false;
    const [recentlyCreatedDiversionRouteVariantId, setRecentlyCreatedDiversionRouteVariantId] = useState(null);


    const [baseRouteVariantOnly, setBaseRouteVariantOnly] = useState(true);
    const [secondaryRouteVariantsList, setSecondaryRouteVariantsList] = useState([]);
    const [selectedOtherRouteVariants, setSelectedOtherRouteVariants] = useState([]);


    const [diversionShapeWkt, setDiversionShapeWkt] = useState(isEditingMode ? props.diversion.diversionShapeWkt : null);


    const [modifiedBaseRouteVariant, setModifiedBaseRouteVariant] = useState();


    const [affectedStops, setAffectedStops] = useState([]);


    const isDiversionValid = modifiedBaseRouteVariant?.shapeWkt?.length > 0
                             && (isEditingMode ? diversionShapeWkt?.length > 0 : diversionShapeWkt?.length > 0);

    const [isUpdated, setIsUpdated] = useState(false);


    const isBusRoute = route => route.routeType === BUS_TYPE_ID;


    const isRouteVariantDisabled = (routeVariant) => {
        if (!routeVariant) {
            return false;
        }


        if (existingDiversions.length > 0) {

            const isDisabled = existingDiversions.some((diversion) => {
                const diversionRouteVariants = diversion.diversionRouteVariants || [];
                return diversionRouteVariants.some(drv => drv.routeVariantId === routeVariant.routeVariantId);
            });

            return isDisabled;
        }


        if (recentlyCreatedDiversionRouteVariantId === routeVariant.routeVariantId) {
            return true;
        }

        return false;
    };


    const getAffectedEntities = () => {
        if (!props.disruption?.affectedEntities) return [];


        if (props.disruption.affectedEntities.affectedRoutes) {
            return props.disruption.affectedEntities.affectedRoutes;
        }


        if (Array.isArray(props.disruption.affectedEntities)) {
            return props.disruption.affectedEntities;
        }


        if (props.disruption.affectedRoutes) {
            return props.disruption.affectedRoutes;
        }

        return [];
    };

    const [routeIds] = useState(() => {
        const affectedEntities = getAffectedEntities();
        const routeIds = affectedEntities.length > 0
            ? [...new Set(affectedEntities.filter(isBusRoute).map(entity => entity.routeId))]
            : [];
        return routeIds;
    });

    const initEditingMode = (routeVariants) => {

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


    const fetchExistingDiversions = useCallback(async () => {
        if (isLoadingExistingDiversions) return;


        const now = Date.now();
        if (fetchExistingDiversions.lastCall && (now - fetchExistingDiversions.lastCall) < 3000) {
            console.warn('Fetch existing diversions called too frequently, skipping');
            return;
        }
        fetchExistingDiversions.lastCall = now;

        try {

            const idToUse = props.disruption.disruptionId || props.disruption.incidentId;
            await props.fetchDiversions(idToUse);


            setRecentlyCreatedDiversionRouteVariantId(null);
        } catch (error) {
            console.error('🔧 DiversionManager - error fetching existing diversions:', error);
        }
    }, [props.disruption.disruptionId, props.disruption.incidentId, isLoadingExistingDiversions, props.fetchDiversions]);


    const fetchVariants = debounce(async () => {
        const start = moment(props.disruption.startTime).tz(dateTypes.TIME_ZONE);
        const end = moment(props.disruption.endTime).tz(dateTypes.TIME_ZONE);
        const startDate = start.format(SERVICE_DATE_FORMAT);
        const startTime = start.format(TIME_FORMAT_HHMM);
        const endDate = end.format(SERVICE_DATE_FORMAT);
        const endTime = end.format(TIME_FORMAT_HHMM);
        try {
            const search = {
                page: 1,
                limit: 1000,
                routeIds,
                ...(startDate !== null && { serviceDateFrom: startDate }),
                ...(startTime !== null && { startTime }),
                ...(endDate !== null && { serviceDateTo: endDate }),
                ...(endTime !== null && { endTime }),
            };
    
            let { routeVariants } = await searchRouteVariants(search);

            if (routeVariants?.length > 0) {

                routeVariants = routeVariants.map(rv => ({ ...rv, shapeWkt: removeDuplicatePoints(rv.shapeWkt) }));
            }
            setRouteVariantsList(routeVariants);
            if (isEditingMode && routeVariants && props.diversion) {
                props.diversion.diversionRouteVariants.forEach((rv) => {
                    const existingVariant = routeVariants.find(r => r.routeVariantId === rv.routeVariantId);
                    if (existingVariant) {

                        existingVariant.hasTripModifications = false;
                    }
                });

                initEditingMode(routeVariants);
            }
        } catch {
            setRouteVariantsList([]);
        }
    }, debounceDelay);


    const handleSelectMainVariant = (variant) => {
        if (variant) {

            const hasValidDiversionShape = diversionShapeWkt && 
                diversionShapeWkt.length > 0 && 
                diversionShapeWkt !== 'LINESTRING()' && 
                diversionShapeWkt !== 'null';
                
            if (hasValidDiversionShape) {

                setTempSelectedBaseRouteVariant(variant);
                setIsChangeVariantModalOpen(true);
            } else {

                setSelectedBaseRouteVariant(null);
                setModifiedBaseRouteVariant(null);
                setInitialBaseRouteShape(null);
                

                setTimeout(() => {
                    setSelectedBaseRouteVariant({ ...variant });
                    setModifiedBaseRouteVariant(createModifiedRouteVariant(variant, variant.shapeWkt));
                    setInitialBaseRouteShape(variant.shapeWkt);
                }, 10);
            }
        } else {

            setSelectedBaseRouteVariant(null);
            setModifiedBaseRouteVariant(null);
            setInitialBaseRouteShape(null);
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
                    hidden: v.routeVariantId === variant.routeVariantId,
                }) : v)));
        }
    };

    useEffect(() => {

        if (diversionShapeWkt?.length > 0 && modifiedBaseRouteVariant) {
            let updatedAffectedStops = [];


            const highlighted = selectedBaseRouteVariant.stops
                .filter(stop => isAffectedStop(stop, modifiedBaseRouteVariant.shapeWkt))
                .map(s => createAffectedStop(s, selectedBaseRouteVariant));
            updatedAffectedStops = [...highlighted];


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

            const isModified = hasDiversionModified({
                isEditingMode,
                diversionShapeWkt,
                originalDiversionShapeWkt: props.diversion.diversionShapeWkt,
                selectedOtherRouteVariants,
                editingDiversions,
            });
            setIsUpdated(isModified);
        }
    }, [diversionShapeWkt, selectedOtherRouteVariants]);


    useEffect(() => {
        if (routeIds.length > 0) {
            fetchVariants();
        }
    }, [routeIds]);




    const onShapeUpdated = (updatedDiversionShape, updatedRouteVariantShape) => {
        setDiversionShapeWkt(updatedDiversionShape);

        if (selectedBaseRouteVariant?.routeVariantId && updatedRouteVariantShape && updatedDiversionShape) {
            setModifiedBaseRouteVariant(createModifiedRouteVariant(selectedBaseRouteVariant, updatedRouteVariantShape));

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
        setSecondaryRouteVariantsList([]);
        setSelectedOtherRouteVariants([]);

    };


    const onCancelClicked = () => {

        setRecentlyCreatedDiversionRouteVariantId(null);


        const effectsContainer = document.getElementById('effects-list');
        const buttonsToHide = effectsContainer ? effectsContainer.querySelectorAll('.js-hide-on-cancel') : [];

        const allModals = document.querySelectorAll(`
            .CustomModal,
            .CustomMuiDialog,
            .disruption-creation__modal,
            .diversion-result-modal,
            .change-selected-route-variant-modal,
            .modal,
            .modal-dialog,
            .modal-content,
            .MuiDialog-root,
            .MuiModal-root,
            .modal-backdrop,
            .MuiBackdrop-root,
            .overlay,
            .backdrop,
            [class*="backdrop"],
            [class*="overlay"],
            [class*="modal"],
            button[style*="z-index"],
            [style*="z-index: 999999"],
            [style*="z-index: 99999"],
            [style*="z-index: 9999"],
            [style*="z-index: 999"],
            .diversions-button-container,
            .diversions-button,
            .diversions-menu-dropdown
        `);


        buttonsToHide.forEach((button) => {

            if (button.closest('.edit-effect-panel')) {
                return;
            }


            if (button.closest('.disruption-edit__container')) {
                return;
            }


            if (button.closest('#effects-list')) {
                button.style.display = 'none';
                button.style.visibility = 'hidden';
                button.style.opacity = '0';
                button.style.zIndex = '-1';
                button.style.pointerEvents = 'none';
            }
        });

        allModals.forEach((modal) => {
            if (modal && !modal.closest('.side-panel-control-component-view')) {

                if (modal.closest('.edit-effect-panel')) {
                    return;
                }

                if (modal.closest('.side-panel-control-component-view')) {
                    return;
                }
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.style.opacity = '0';
                modal.style.zIndex = '-1';
                modal.style.pointerEvents = 'none';
            }
        });


        document.body.classList.remove('modal-open', 'diversion-manager-active');

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



        document.body.classList.remove('diversion-result-active');

        props.resetDiversionResult();

        if (action === ACTION_TYPE.NEW_DIVERSION) {



            const routeVariantId = selectedBaseRouteVariant?.routeVariantId;
            if (routeVariantId) {
                setRecentlyCreatedDiversionRouteVariantId(routeVariantId);
            }

            reset();
            props.clearDiversionsCache(props.disruption.disruptionId);

                setTimeout(() => {
                    fetchExistingDiversions();
                }, 1000);
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

            const availableRouteVariants = updatedSecondaryList.filter(v => !v.hasTripModifications && !v.hidden);
            if (availableRouteVariants.length > 0) {
                const updatedSelectedOtherRouteVariants = availableRouteVariants.map(rv => mergeDiversionToRouteVariant(rv, rv.shapeWkt, diversionShapeWkt));
                setSelectedOtherRouteVariants(updatedSelectedOtherRouteVariants);
                setSecondaryRouteVariantsList(updatedSecondaryList.map(v => ({
                    ...v,
                    hidden: availableRouteVariants
                        .some(rv => rv.routeVariantId === v.routeVariantId) ? true : v.hidden,
                })));
            } else {
                setSelectedOtherRouteVariants([]);
                setSecondaryRouteVariantsList(updatedSecondaryList);
            }
        }
    };

    const handleRemoveRouteVariant = (routeVariantId) => {

        const updatedAdditionalRouteVariants = selectedOtherRouteVariants.filter(
            variant => variant.routeVariantId !== routeVariantId,
        );
        setSelectedOtherRouteVariants(updatedAdditionalRouteVariants);


        setSecondaryRouteVariantsList(
            secondaryRouteVariantsList.map(variant => (variant.routeVariantId === routeVariantId
                ? { ...variant, hidden: false }
                : variant)),
        );
    };

    const shouldShowDiversionManager = props.isOpen;


    React.useEffect(() => {
        if (props.isOpen) {
            const handleCloseButtonClick = () => {
        

                const mapElements = document.querySelectorAll('.leaflet-control-container, .leaflet-control-zoom, .leaflet-control-draw, .leaflet-pane, .leaflet-overlay-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane');
                mapElements.forEach((element) => {
                    if (element) {
                        element.style.display = 'none';
                        element.style.visibility = 'hidden';
                        element.style.opacity = '0';
                    }
                });


                const mapContainer = document.querySelector('.leaflet-container');
                if (mapContainer) {
                    mapContainer.style.display = 'none';
                    mapContainer.style.visibility = 'hidden';
                    mapContainer.style.opacity = '0';
                }


                if (props.onCancelled) {
                                    props.onCancelled();
            } else {
                }
            };


            const closeButton = document.querySelector('.disruption-creation-close-disruptions');
            if (closeButton) {
                closeButton.addEventListener('click', handleCloseButtonClick);


                return () => {
                    closeButton.removeEventListener('click', handleCloseButtonClick);
                };
            }
        }
    }, [props.isOpen]);


    React.useEffect(() => {
        if (!props.resultState.isLoading && (!!props.resultState?.diversionId || !!props.resultState?.error)) {
            document.body.classList.add('diversion-result-active');
        } else {
            document.body.classList.remove('diversion-result-active');
        }
    }, [props.resultState.isLoading, props.resultState?.diversionId, props.resultState?.error]);


    React.useEffect(() => {
        const hasId = props.disruption?.incidentId || props.disruption?.disruptionId;
        let lastFetchTime = 0;
        const MIN_FETCH_INTERVAL = 3000;


        if (props.isOpen && hasId && !isLoadingExistingDiversions && existingDiversions.length === 0) {
            const now = Date.now();
            if ((now - lastFetchTime) > MIN_FETCH_INTERVAL) {
                lastFetchTime = now;

                const timeoutId = setTimeout(() => {
                    fetchExistingDiversions();
                }, 500);

                return () => clearTimeout(timeoutId);
            }
        }
    }, [props.isOpen, props.disruption?.incidentId, props.disruption?.disruptionId, isLoadingExistingDiversions, existingDiversions.length, fetchExistingDiversions]);

    const isRouteVariantDisabledWithLogging = routeVariant => isRouteVariantDisabled(routeVariant);

    return (
        <div className="side-panel-control-component-view diversion-manager d-flex">
            <SidePanel
                isOpen={ shouldShowDiversionManager }
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
                        isRouteVariantDisabled={ isRouteVariantDisabledWithLogging }
                        isLoadingExistingDiversions={ isLoadingExistingDiversions }
                        existingDiversions={ existingDiversions }
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
                                isRouteVariantDisabled={ isRouteVariantDisabledWithLogging }
                                isLoadingExistingDiversions={ isLoadingExistingDiversions }
                                existingDiversions={ existingDiversions }
                            />
                        ) }
                    </div>
                    <AffectedStops affectedStops={ affectedStops } />
                    {/* Panel Footer - Always Visible */}
                    {!(!props.resultState.isLoading && (!!props.resultState?.diversionId || !!props.resultState?.error)) && (
                        <div className="panel-footer">
                            <div className="d-flex justify-content-between align-items-center">
                                <Button
                                    className="btn cc-btn-secondary"
                                    onClick={ (e) => {
                                        onCancelClicked();
                                    } }
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="btn cc-btn-primary"
                                    onClick={ onSaveClicked }
                                    disabled={ (isEditingMode && !isUpdated) || !isDiversionValid || props.resultState.isLoading }
                                >
                                    { buttonText }
                                </Button>
                            </div>
                        </div>
                    )}
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


            {(() => {
                if (typeof window !== 'undefined') {
                    
                }
                return !props.resultState.isLoading && (!!props.resultState?.diversionId || !!props.resultState?.error);
            })() && (
                <>
                    <style>
                        {`
                            .panel-footer {
                                display: none !important;
                                visibility: hidden !important;
                                opacity: 0 !important;
                            }
                        `}
                    </style>
                    <div
                        className="diversion-result-modal"
                        style={ {
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 99999999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        } }
                    >
                        <div
                            className="diversion-result-modal"
                            style={ {
                                background: 'white',
                                padding: '30px',
                                borderRadius: '8px',
                                maxWidth: '500px',
                                width: '90%',
                                zIndex: 99999999,
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #ddd',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '200px',
                            } }
                        >
                            <div style={ { flex: 1, display: 'flex', alignItems: 'center' } }>
                                <div style={ { width: '100%', textAlign: 'center' } }>
                                    <div>
                                        <span style={ { display: 'block', marginTop: '12px', marginBottom: '8px' } }>
                                            {props.resultState?.diversionId ? `Diversion #${props.resultState.diversionId} has been ${resultAction}.` : ''}
                                        </span>
                                        <span style={ { display: 'block', marginTop: '12px', marginBottom: '8px', color: '#dc3545' } }>
                                            {props.resultState?.error?.message}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={ { marginTop: 'auto' } }>
                                {props.resultState?.error ? (
                                    <div style={ { display: 'flex', justifyContent: 'center', marginTop: '12px' } }>
                                        <button
                                            className="btn cc-btn-secondary"
                                            aria-label="Return"
                                            onClick={ () => handleResultAction('RETURN_TO_DIVERSION') }
                                            style={ {
                                                padding: '10px 20px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                width: '200px',
                                            } }>
                                            Return
                                        </button>
                                    </div>
                                ) : (
                                    <div style={ { display: 'flex', alignItems: 'stretch', gap: '16px', width: '100%' } }>
                                        <button
                                            className="btn cc-btn-secondary"
                                            aria-label="Close"
                                            onClick={ () => handleResultAction('RETURN_TO_DISRUPTION') }
                                            style={ {
                                                padding: '10px 20px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                flex: 1,
                                                height: '40px',
                                                lineHeight: '20px',
                                            } }>
                                            Close
                                        </button>

                                        {!isEditingMode && props.resultState?.diversionId && (
                                            <button
                                                className="btn cc-btn-primary"
                                                aria-label="Add new diversion"
                                                onClick={ () => handleResultAction('NEW_DIVERSION') }
                                                style={ {
                                                    padding: '10px 20px',
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem',
                                                    flex: 1,
                                                    height: '40px',
                                                    lineHeight: '20px',
                                                } }>
                                                Add new diversion
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

DiversionManager.propTypes = {
    editMode: PropTypes.string.isRequired,
    createDiversion: PropTypes.func.isRequired,
    updateDiversion: PropTypes.func.isRequired,
    resetDiversionResult: PropTypes.func.isRequired,
    fetchDiversions: PropTypes.func.isRequired,
    clearDiversionsCache: PropTypes.func.isRequired,
    disruption: PropTypes.object,
    onCancelled: PropTypes.func,
    onDiversionCreated: PropTypes.func,
    resultState: PropTypes.object,
    diversion: PropTypes.object,
    state: PropTypes.object,
};

DiversionManager.defaultProps = {
    disruption: null,
    onCancelled: null,
    onDiversionCreated: null,
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
    state, 
}), {
    createDiversion,
    updateDiversion,
    resetDiversionResult,
    fetchDiversions,
    clearDiversionsCache,
})(DiversionManager);
