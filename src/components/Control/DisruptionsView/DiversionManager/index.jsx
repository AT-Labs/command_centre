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

    // Compute these values after props are available
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
    // Use centralized diversions data instead of local state
    const existingDiversions = getDiversionsForDisruption(props.disruption?.disruptionId || props.disruption?.incidentId)(props.state) || [];
    const isLoadingExistingDiversions = getDiversionsLoadingForDisruption(props.disruption?.disruptionId || props.disruption?.incidentId)(props.state) || false;
    const [recentlyCreatedDiversionRouteVariantId, setRecentlyCreatedDiversionRouteVariantId] = useState(null);

    // For additional route variants
    const [baseRouteVariantOnly, setBaseRouteVariantOnly] = useState(true);
    const [secondaryRouteVariantsList, setSecondaryRouteVariantsList] = useState([]);
    const [selectedOtherRouteVariants, setSelectedOtherRouteVariants] = useState([]); // Also hold the updated shape. It is not the final payload.

    // Shared diversion shape
    const [diversionShapeWkt, setDiversionShapeWkt] = useState(isEditingMode ? props.diversion.diversionShapeWkt : null);

    // Updated base route variant
    const [modifiedBaseRouteVariant, setModifiedBaseRouteVariant] = useState();

    // Affected stops
    const [affectedStops, setAffectedStops] = useState([]);

    // Other variables
    const isDiversionValid = modifiedBaseRouteVariant?.shapeWkt?.length > 0
                             && (isEditingMode ? diversionShapeWkt?.length > 0 : diversionShapeWkt?.length > 0);

    const [isUpdated, setIsUpdated] = useState(false);

    // We only support adding diversion to bus route at the moment.
    const isBusRoute = route => route.routeType === BUS_TYPE_ID;

    // Check if a route variant is disabled due to existing diversions
    const isRouteVariantDisabled = (routeVariant) => {
        if (!routeVariant) {
            return false;
        }

        // If we have existing diversions data, use it regardless of loading state
        if (existingDiversions.length > 0) {
            // Check if this route variant already has a diversion
            const isDisabled = existingDiversions.some((diversion) => {
                const diversionRouteVariants = diversion.diversionRouteVariants || [];
                return diversionRouteVariants.some(drv => drv.routeVariantId === routeVariant.routeVariantId);
            });

            return isDisabled;
        }

        // Also check if this route variant was recently used to create a diversion
        if (recentlyCreatedDiversionRouteVariantId === routeVariant.routeVariantId) {
            return true;
        }

        return false;
    };

    // Handle both old array structure and new object structure
    const getAffectedEntities = () => {
        if (!props.disruption?.affectedEntities) return [];

        // New structure: { affectedRoutes: [...], affectedStops: [...] }
        if (props.disruption.affectedEntities.affectedRoutes) {
            return props.disruption.affectedEntities.affectedRoutes;
        }

        // Old structure: array of entities
        if (Array.isArray(props.disruption.affectedEntities)) {
            return props.disruption.affectedEntities;
        }

        // Handle incident data structure (for DiversionManager from EditEffectPanel)
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

    // Fetch existing diversions for this disruption
    const fetchExistingDiversions = useCallback(async () => {
        if (isLoadingExistingDiversions) return; // Prevent multiple simultaneous calls

        // Add additional protection against multiple calls
        const now = Date.now();
        if (fetchExistingDiversions.lastCall && (now - fetchExistingDiversions.lastCall) < 3000) {
            console.warn('Fetch existing diversions called too frequently, skipping');
            return;
        }
        fetchExistingDiversions.lastCall = now;

        try {
            // Try both incidentId and disruptionId
            const idToUse = props.disruption.disruptionId || props.disruption.incidentId;
            await props.fetchDiversions(idToUse);

            // Clear the recently created diversion route variant ID since we now have updated data
            setRecentlyCreatedDiversionRouteVariantId(null);
        } catch (error) {
            console.error('🔧 DiversionManager - error fetching existing diversions:', error);
        }
    }, [props.disruption.disruptionId, props.disruption.incidentId, isLoadingExistingDiversions, props.fetchDiversions]);

    // Fetch available route variants to populate the dropdown lists
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
            // Check if diversionShapeWkt exists and is not empty
            const hasValidDiversionShape = diversionShapeWkt && 
                diversionShapeWkt.length > 0 && 
                diversionShapeWkt !== 'LINESTRING()' && 
                diversionShapeWkt !== 'null';
                
            if (hasValidDiversionShape) {
                // If there are changes already
                setTempSelectedBaseRouteVariant(variant);
                setIsChangeVariantModalOpen(true);
            } else {
                // Force a complete reset to ensure the map updates
                setSelectedBaseRouteVariant(null);
                setModifiedBaseRouteVariant(null);
                setInitialBaseRouteShape(null);
                
                // Use setTimeout to ensure the reset completes before setting new values
                setTimeout(() => {
                    setSelectedBaseRouteVariant({ ...variant });
                    setModifiedBaseRouteVariant(createModifiedRouteVariant(variant, variant.shapeWkt));
                    setInitialBaseRouteShape(variant.shapeWkt);
                }, 10);
            }
        } else {
            // reset
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
                originalDiversionShapeWkt: props.diversion.diversionShapeWkt,
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
        setSecondaryRouteVariantsList([]);
        setSelectedOtherRouteVariants([]);

    };

    // Buttons
    const onCancelClicked = () => {
        // Clear the recently created diversion route variant ID when cancelling
        setRecentlyCreatedDiversionRouteVariantId(null);

        // Force hide all modals and overlays before closing
        // Find buttons to hide only within the effects-list container
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

        // Hide specific buttons within effects-list only, but not in EditEffectPanel or disruption-edit__container
        buttonsToHide.forEach((button) => {
            // Don't hide buttons that are in EditEffectPanel
            if (button.closest('.edit-effect-panel')) {
                return;
            }

            // Don't hide buttons that are in disruption-edit__container
            if (button.closest('.disruption-edit__container')) {
                return;
            }

            // Only hide buttons that are actually inside the effects-list container
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
                // Don't hide the DISR button in EditEffectPanel
                if (modal.closest('.edit-effect-panel')) {
                    return;
                }
                // Don't hide any buttons inside DiversionManager itself
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

        // Also remove any backdrop classes from body
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


            // Store the route variant ID that was just used to create a diversion
            const routeVariantId = selectedBaseRouteVariant?.routeVariantId;
            if (routeVariantId) {
                setRecentlyCreatedDiversionRouteVariantId(routeVariantId);
            }

            reset();
            props.clearDiversionsCache(props.disruption.disruptionId);
                            // Add delay to ensure API has updated
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

    const shouldShowDiversionManager = props.isOpen;

    // Add listener for Close button clicks when DiversionManager is open
    React.useEffect(() => {
        if (props.isOpen) {
            const handleCloseButtonClick = () => {
        
                // Hide all map elements when close button is clicked
                const mapElements = document.querySelectorAll('.leaflet-control-container, .leaflet-control-zoom, .leaflet-control-draw, .leaflet-pane, .leaflet-overlay-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane');
                mapElements.forEach((element) => {
                    if (element) {
                        element.style.display = 'none';
                        element.style.visibility = 'hidden';
                        element.style.opacity = '0';
                    }
                });

                // Also hide the entire map container
                const mapContainer = document.querySelector('.leaflet-container');
                if (mapContainer) {
                    mapContainer.style.display = 'none';
                    mapContainer.style.visibility = 'hidden';
                    mapContainer.style.opacity = '0';
                }

                // Call the onCancelled callback to properly close the DiversionManager
                if (props.onCancelled) {
                                    props.onCancelled();
            } else {
                }
            };

            // Find the Close button and add event listener
            const closeButton = document.querySelector('.disruption-creation-close-disruptions');
            if (closeButton) {
                closeButton.addEventListener('click', handleCloseButtonClick);

                // Cleanup function
                return () => {
                    closeButton.removeEventListener('click', handleCloseButtonClick);
                };
            }
        }
    }, [props.isOpen]);

    // Add/remove body class when result modal is active
    React.useEffect(() => {
        if (!props.resultState.isLoading && (!!props.resultState?.diversionId || !!props.resultState?.error)) {
            document.body.classList.add('diversion-result-active');
        } else {
            document.body.classList.remove('diversion-result-active');
        }
    }, [props.resultState.isLoading, props.resultState?.diversionId, props.resultState?.error]);

    // Fetch existing diversions when DiversionManager opens
    React.useEffect(() => {
        const hasId = props.disruption?.incidentId || props.disruption?.disruptionId;
        let lastFetchTime = 0;
        const MIN_FETCH_INTERVAL = 3000; // 3 seconds minimum between fetches

        // Only fetch if we're open, have an ID, and either not loading or no existing data
        if (props.isOpen && hasId && !isLoadingExistingDiversions && existingDiversions.length === 0) {
            const now = Date.now();
            if ((now - lastFetchTime) > MIN_FETCH_INTERVAL) {
                lastFetchTime = now;
                // Add debouncing to prevent excessive API calls
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
                            <div style={ { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
                                <div style={ { width: '100%', textAlign: 'center', padding: '20px 20px 20px 20px' } }>
                                    <div>
                                        <span style={ { display: 'block', marginTop: '0px', marginBottom: '8px', fontSize: '16px', fontWeight: '500' } }>
                                            {props.resultState?.diversionId ? `Diversion #${props.resultState.diversionId} has been ${resultAction}.` : ''}
                                        </span>
                                        <span style={ { display: 'block', marginTop: '12px', marginBottom: '0px', color: '#dc3545', fontSize: '16px' } }>
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
