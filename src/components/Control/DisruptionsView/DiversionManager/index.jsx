import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import { debounce } from 'lodash';

import '../../../Common/OffCanvasLayout/OffCanvasLayout.scss';
import './styles.scss';
import SidePanel from '../../../Common/OffCanvasLayout/SidePanel/SidePanel';
import RouteShapeEditor from '../../../Common/Map/RouteShapeEditor/RouteShapeEditor';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ChangeSelectedRouteVariantModal from './ChangeSelectedRouteVariantModal';
import { createDiversion, updateDiversion, fetchDiversions, clearDiversionsCache } from '../../../../redux/actions/control/diversions';
import { getDiversionForEditing, getDiversionEditMode, getDiversionsForDisruption, getDiversionsLoadingForDisruption } from '../../../../redux/selectors/control/diversions';

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
    const [isUpdated, setIsUpdated] = useState(false);
    const [isDiversionValid, setIsDiversionValid] = useState(false);

    const [forceUpdate, setForceUpdate] = useState(0);

    const title = `${props.editMode === EDIT_TYPE.EDIT ? 'Edit' : 'Add'} Diversion`;
    const buttonText = `${props.editMode === EDIT_TYPE.EDIT ? 'Update' : 'Create'} Diversion`;
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

    // For additional route variants
    const [baseRouteVariantOnly, setBaseRouteVariantOnly] = useState(true);
    const [secondaryRouteVariantsList, setSecondaryRouteVariantsList] = useState([]);
    const [selectedOtherRouteVariants, setSelectedOtherRouteVariants] = useState([]); // Also hold the updated shape. It is not the final payload.

    // Shared diversion shape
    const [diversionShapeWkt, setDiversionShapeWkt] = useState(isEditingMode ? props.diversion?.diversionShapeWkt : null);

    // Updated base route variant
    const [modifiedBaseRouteVariant, setModifiedBaseRouteVariant] = useState();

    // Affected stops
    const [affectedStops, setAffectedStops] = useState([]);

    // Other variables

    // We only support adding diversion to bus route at the moment.
    const isBusRoute = route => route.routeType === BUS_TYPE_ID;
    const [routeIds] = useState(() => {
        const affectedEntities = props.disruption?.affectedEntities;

        const routeIdsArray = (() => {
            if (Array.isArray(affectedEntities) && affectedEntities.length > 0) {
                return [...new Set(affectedEntities.filter(isBusRoute).map(entity => entity.routeId))];
            }

            if (affectedEntities && typeof affectedEntities === 'object' && !Array.isArray(affectedEntities)) {
                const keys = Object.keys(affectedEntities);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value = affectedEntities[key];
                    if (Array.isArray(value) && value.length > 0) {
                        return [...new Set(value.filter(isBusRoute).map(entity => entity.routeId))];
                    }
                }
            }

            return [];
        })();
        return routeIdsArray;
    });

    // Update isDiversionValid when state changes
    const updateDiversionValid = useCallback(() => {
        const isValid = modifiedBaseRouteVariant?.shapeWkt?.length > 0
                       && diversionShapeWkt?.length > 0
                       && diversionShapeWkt !== 'LINESTRING()';

        setIsDiversionValid(isValid);
    }, [modifiedBaseRouteVariant, diversionShapeWkt, forceUpdate]);

    // Force update when dependencies change
    useEffect(() => {
        updateDiversionValid();
    }, [updateDiversionValid]);

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

    const initEditingMode = (routeVariants) => {
        // Select the base route in edit mode
        if (!props.diversion?.diversionRouteVariants?.length) {
            return;
        }
        const baseRouteVariantId = props.diversion.diversionRouteVariants[0].routeVariantId;
        const baseRouteVariant = routeVariants.find(rv => rv.routeVariantId === baseRouteVariantId);
        if (baseRouteVariant) {
            setSelectedBaseRouteVariant(baseRouteVariant);
            const initialCoordinates = isEditingMode && props.diversion?.diversionShapeWkt ? mergeCoordinates(
                parseWKT(baseRouteVariant.shapeWkt),
                parseWKT(props.diversion.diversionShapeWkt),
            ) : [];
            setInitialBaseRouteShape(initialCoordinates.length > 0 ? toWKT(initialCoordinates) : baseRouteVariant.shapeWkt);
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

    const fetchExistingDiversions = useCallback(async () => {
        if (isLoadingExistingDiversions) return;

        const now = Date.now();
        if (fetchExistingDiversions.lastCall && (now - fetchExistingDiversions.lastCall) < 3000) {
            return;
        }
        fetchExistingDiversions.lastCall = now;

        try {
            if (!props.disruption?.disruptionId && !props.disruption?.incidentId) {
                return;
            }
            const idToUse = props.disruption.disruptionId || props.disruption.incidentId;
            await props.fetchDiversions(idToUse);

            setRecentlyCreatedDiversionRouteVariantId(null);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error fetching diversions:', error);
        }
    }, [props.disruption.disruptionId, props.disruption.incidentId, isLoadingExistingDiversions, props.fetchDiversions]);

    // Fetch available route variants to populate the dropdown lists
    const fetchVariants = debounce(async () => {
        if (!props.disruption?.startTime || !props.disruption?.endTime) {
            return;
        }
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

            // Initialize secondaryRouteVariantsList for CREATE mode
            if (!isEditingMode && routeVariants?.length > 0) {
                setSecondaryRouteVariantsList(routeVariants.map(rv => ({
                    ...rv,
                    hidden: false, // Show all variants initially
                })));
            }

            if (isEditingMode && routeVariants && props.diversion?.diversionRouteVariants?.length) {
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
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error fetching route variants:', error);
            setRouteVariantsList([]);
        }
    }, debounceDelay);

    // Drop down lists
    const handleSelectMainVariant = (variant) => {
        if (variant) {
            // Check if diversionShapeWkt exists and is not empty
            const hasValidDiversionShape = diversionShapeWkt
                && diversionShapeWkt.length > 0
                && diversionShapeWkt !== 'LINESTRING()'
                && diversionShapeWkt !== 'null';

            if (hasValidDiversionShape) {
                // If there are changes already
                setTempSelectedBaseRouteVariant(variant);
                setIsChangeVariantModalOpen(true);
            } else {
                // Force a complete reset to ensure the map updates
                setSelectedBaseRouteVariant(null);
                setModifiedBaseRouteVariant(null);
                setInitialBaseRouteShape(null);

                setSelectedBaseRouteVariant({ ...variant });

                const newModifiedBaseRouteVariant = createModifiedRouteVariant(variant, variant.shapeWkt);
                setModifiedBaseRouteVariant(newModifiedBaseRouteVariant);

                setInitialBaseRouteShape(variant.shapeWkt);

                // Force update after state changes
                setTimeout(() => {
                    setForceUpdate(prev => prev + 1);
                }, 0);
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
            const newModifiedBaseRouteVariant = createModifiedRouteVariant(selectedBaseRouteVariant, updatedRouteVariantShape);
            setModifiedBaseRouteVariant(newModifiedBaseRouteVariant);

            // Force update after state changes
            setTimeout(() => {
                setForceUpdate(prev => prev + 1);
            }, 0);

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

    // Buttons
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
            [style*="z-index: 99"],
            [style*="z-index: 100"],
            [style*="z-index: 101"],
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
                const buttonElement = button;
                buttonElement.style.display = 'none';
                buttonElement.style.visibility = 'hidden';
                buttonElement.style.opacity = '0';
                buttonElement.style.zIndex = '-1';
                buttonElement.style.pointerEvents = 'none';
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
                const modalElement = modal;
                modalElement.style.display = 'none';
                modalElement.style.visibility = 'hidden';
                modalElement.style.opacity = '0';
                modalElement.style.zIndex = '-1';
                modalElement.style.pointerEvents = 'none';
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

            if (!props.disruption?.disruptionId) {
                return;
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

    React.useEffect(() => {
        if (props.isOpen) {
            const handleCloseButtonClick = () => {
                const mapElements = document.querySelectorAll(
                    '.leaflet-control-container, .leaflet-control-zoom, .leaflet-control-draw, '
                    + '.leaflet-pane, .leaflet-overlay-pane, .leaflet-marker-pane, '
                    + '.leaflet-tooltip-pane, .leaflet-popup-pane',
                );
                mapElements.forEach((element) => {
                    if (element) {
                        const elementNode = element;
                        elementNode.style.display = 'none';
                        elementNode.style.visibility = 'hidden';
                        elementNode.style.opacity = '0';
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
        return undefined;
    }, [props.isOpen]);

    React.useEffect(() => {
        const hasId = props.disruption?.incidentId || props.disruption?.disruptionId;
        let lastFetchTime = 0;
        const MIN_FETCH_INTERVAL = 3000;

        if (props.isOpen && hasId && !props.isLoadingExistingDiversions && editingDiversions.length === 0) {
            const now = Date.now();
            if ((now - lastFetchTime) > MIN_FETCH_INTERVAL) {
                lastFetchTime = now;
                fetchExistingDiversions();
            }
        }
    }, [props.isOpen, props.disruption?.incidentId, props.disruption?.disruptionId, props.isLoadingExistingDiversions, editingDiversions.length]);

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
                        isRouteVariantDisabled={ isRouteVariantDisabled }
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
                        {!baseRouteVariantOnly && (
                            <AdditionalRouteVariantSelector
                                routeVariantsList={ secondaryRouteVariantsList }
                                selectedRouteVariants={ selectedOtherRouteVariants }
                                onSelectVariant={ handleSelectOtherVariant }
                                onVisibilityChange={ handleOtherVisibilityChange }
                                onRouteVariantRemoved={ handleRemoveRouteVariant }
                                isRouteVariantDisabled={ isRouteVariantDisabled }
                                isLoadingExistingDiversions={ isLoadingExistingDiversions }
                                existingDiversions={ existingDiversions }
                            />
                        )}
                    </div>
                    <AffectedStops affectedStops={ affectedStops } />
                    <div className="panel-footer">
                        <div className="d-flex justify-content-between align-items-center">
                            <Button
                                className="btn cc-btn-secondary"
                                onClick={ () => {
                                    onCancelClicked();
                                } }
                            >
                                Cancel
                            </Button>
                            <Button
                                className="btn cc-btn-primary"
                                onClick={ onSaveClicked }
                                disabled={ (isEditingMode && !isUpdated) || !isDiversionValid }
                            >
                                { buttonText }
                            </Button>
                        </div>
                    </div>
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

        </div>
    );
};

DiversionManager.propTypes = {
    editMode: PropTypes.string.isRequired,
    createDiversion: PropTypes.func.isRequired,
    updateDiversion: PropTypes.func.isRequired,
    fetchDiversions: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    clearDiversionsCache: PropTypes.func.isRequired,
    disruption: PropTypes.object,
    onCancelled: PropTypes.func,
    diversion: PropTypes.object,
    state: PropTypes.object,
    isOpen: PropTypes.bool,
    isLoadingExistingDiversions: PropTypes.bool,
};

DiversionManager.defaultProps = {
    disruption: null,
    onCancelled: null,
    diversion: null,
    isOpen: false,
    isLoadingExistingDiversions: false,
    state: null,
};

export default connect(state => ({
    editMode: getDiversionEditMode(state),
    diversion: getDiversionForEditing(state),
    state,
}), {
    createDiversion,
    updateDiversion,
    fetchDiversions,
    clearDiversionsCache,
})(DiversionManager);
