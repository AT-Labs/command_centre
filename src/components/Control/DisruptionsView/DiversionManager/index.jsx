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
    
    // State for managing result modal delay
    const [showResultModal, setShowResultModal] = useState(false);

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
    const [diversionShapeWkt, setDiversionShapeWkt] = useState(isEditingMode ? props.diversion.diversionShapeWkt : null);

    // Updated base route variant
    const [modifiedBaseRouteVariant, setModifiedBaseRouteVariant] = useState();

    // Affected stops
    const [affectedStops, setAffectedStops] = useState([]);

    // Other variables
    const isDiversionValid = modifiedBaseRouteVariant?.shapeWkt?.length > 0 && 
                             (isEditingMode ? diversionShapeWkt?.length > 0 : diversionShapeWkt?.length > 0);
    const [isUpdated, setIsUpdated] = useState(false);

    // We only support adding diversion to bus route at the moment.
    const isBusRoute = route => route.routeType === BUS_TYPE_ID;
    
    // Handle both old array structure and new object structure
    const getAffectedEntities = () => {
        console.log('🔧 DiversionManager - props.disruption:', props.disruption);
        console.log('🔧 DiversionManager - props.disruption.affectedEntities:', props.disruption?.affectedEntities);
        
        if (!props.disruption?.affectedEntities) return [];
        
        // New structure: { affectedRoutes: [...], affectedStops: [...] }
        if (props.disruption.affectedEntities.affectedRoutes) {
            console.log('🔧 DiversionManager - using affectedEntities.affectedRoutes:', props.disruption.affectedEntities.affectedRoutes);
            return props.disruption.affectedEntities.affectedRoutes;
        }
        
        // Old structure: array of entities
        if (Array.isArray(props.disruption.affectedEntities)) {
            console.log('🔧 DiversionManager - using affectedEntities array:', props.disruption.affectedEntities);
            return props.disruption.affectedEntities;
        }
        
        // Handle incident data structure (for DiversionManager from EditEffectPanel)
        if (props.disruption.affectedRoutes) {
            console.log('🔧 DiversionManager - using top-level affectedRoutes:', props.disruption.affectedRoutes);
            return props.disruption.affectedRoutes;
        }
        
        console.log('🔧 DiversionManager - no affected entities found');
        return [];
    };
    
    const [routeIds] = useState(() => {
        const affectedEntities = getAffectedEntities();
        const routeIds = affectedEntities.length > 0
            ? [...new Set(affectedEntities.filter(isBusRoute).map(entity => entity.routeId))]
            : [];
        console.log('🔧 DiversionManager - affectedEntities:', affectedEntities);
        console.log('🔧 DiversionManager - routeIds:', routeIds);
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
            console.log('🔧 DiversionManager - searchRouteVariants params:', search);
            let { routeVariants } = await searchRouteVariants(search);
            console.log('🔧 DiversionManager - searchRouteVariants response:', routeVariants);
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
                // Initialize modifiedBaseRouteVariant with the original shape
                setModifiedBaseRouteVariant(createModifiedRouteVariant(variant, variant.shapeWkt));
                // Set the initial shape for the RouteShapeEditor to display
                setInitialBaseRouteShape(variant.shapeWkt);
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
    };

    // Buttons
    const onCancelClicked = () => {
        console.log('🔧 DiversionManager - onCancelClicked called');
        if (props.onCancelled) {
            console.log('🔧 DiversionManager - calling props.onCancelled()');
            props.onCancelled();
        } else {
            console.log('🔧 DiversionManager - props.onCancelled is not provided');
        }
    };



    const onSaveClicked = async () => {
        console.log('🔧 DiversionManager - onSaveClicked called');
        console.log('🔧 DiversionManager - modifiedBaseRouteVariant:', modifiedBaseRouteVariant);
        console.log('🔧 DiversionManager - diversionShapeWkt:', diversionShapeWkt);
        console.log('🔧 DiversionManager - isEditingMode:', isEditingMode);
        
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

            console.log('🔧 DiversionManager - diversionPayload:', diversionPayload);

            if (isEditingMode) {
                console.log('🔧 DiversionManager - calling updateDiversion');
                props.updateDiversion({
                    ...diversionPayload,
                    diversionId: props.diversion.diversionId,
                });
            } else {
                console.log('🔧 DiversionManager - calling createDiversion');
                props.createDiversion(diversionPayload);
            }
        } else {
            console.log('🔧 DiversionManager - save conditions not met');
            console.log('🔧 DiversionManager - modifiedBaseRouteVariant exists:', !!modifiedBaseRouteVariant);
            console.log('🔧 DiversionManager - diversionShapeWkt exists:', !!diversionShapeWkt);
        }
    };

    const handleResultAction = (action) => {
        console.log('🔧 DiversionManager - handleResultAction called with action:', action);
        console.log('🔧 DiversionManager - props.onCancelled exists:', !!props.onCancelled);
        console.log('🔧 DiversionManager - props.onDiversionCreated exists:', !!props.onDiversionCreated);
        
        setShowResultModal(false);
        props.resetDiversionResult();
        
        if (action === ACTION_TYPE.NEW_DIVERSION) {
            console.log('🔧 DiversionManager - NEW_DIVERSION action, calling reset()');
            reset();
        } else if (action === ACTION_TYPE.RETURN_TO_DISRUPTION) {
            console.log('🔧 DiversionManager - RETURN_TO_DISRUPTION action');
            // Close the DiversionManager modal
            if (props.onCancelled) {
                console.log('🔧 DiversionManager - calling onCancelled()');
                props.onCancelled();
            } else {
                console.log('🔧 DiversionManager - onCancelled prop is not provided');
            }
            // Trigger a refresh of the incident data to include the new diversion
            if (props.onDiversionCreated) {
                console.log('🔧 DiversionManager - calling onDiversionCreated()');
                props.onDiversionCreated();
            } else {
                console.log('🔧 DiversionManager - onDiversionCreated prop is not provided');
            }
        }
    };
    
    // Auto-close modal when diversion is successfully created
    useEffect(() => {
        if (props.resultState?.diversionId && !props.resultState?.error && !props.resultState?.isLoading) {
            console.log('🔧 DiversionManager - Success modal shown, user can choose to add more or close');
            // Trigger a refresh of the incident data to include the new diversion
            if (props.onDiversionCreated) {
                console.log('🔧 DiversionManager - calling onDiversionCreated() for data refresh');
                props.onDiversionCreated();
            }
            
            // Add delay before showing result modal
            setTimeout(() => {
                setShowResultModal(true);
            }, 800); // 800ms delay
        } else {
            setShowResultModal(false);
        }
    }, [props.resultState?.diversionId, props.resultState?.error, props.resultState?.isLoading]);
    


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

    console.log('🔧 DiversionManager - render - resultState:', props.resultState);
    console.log('🔧 DiversionManager - render - isLoading:', props.resultState?.isLoading);
    console.log('🔧 DiversionManager - render - diversionId:', props.resultState?.diversionId);
    console.log('🔧 DiversionManager - render - error:', props.resultState?.error);
    console.log('🔧 DiversionManager - render - props.isOpen:', props.isOpen, typeof props.isOpen);
    console.log('🔧 DiversionManager - render - props.disruption:', props.disruption);
    console.log('🔧 DiversionManager - render - props.disruption?.affectedEntities:', props.disruption?.affectedEntities);
    console.log('🔧 DiversionManager - render - should render:', props.isOpen ? 'YES' : 'NO');
    console.log('🔧 DiversionManager - render - props.isOpen value:', props.isOpen);
    console.log('🔧 DiversionManager - render - props.isOpen type:', typeof props.isOpen);
    console.log('🔧 DiversionManager - render - props.isOpen === true:', props.isOpen === true);
    console.log('🔧 DiversionManager - render - props.isOpen === false:', props.isOpen === false);
    
    // Hide DiversionManager when result modal is shown
    const isResultModalOpen = showResultModal || (!props.resultState.isLoading && props.resultState?.error);
    const shouldShowDiversionManager = props.isOpen && !isResultModalOpen;
    
                // Add CSS to hide map elements when result modal is shown
    React.useEffect(() => {
        if (isResultModalOpen) {
            // Hide all map-related elements when result modal is shown
            const mapElements = document.querySelectorAll('.leaflet-control-container, .leaflet-control-zoom, .leaflet-control-draw, .leaflet-pane, .leaflet-overlay-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane');
            mapElements.forEach(element => {
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
        } else {
            // Show map elements when result modal is hidden
            const mapElements = document.querySelectorAll('.leaflet-control-container, .leaflet-control-zoom, .leaflet-control-draw, .leaflet-pane, .leaflet-overlay-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane');
            mapElements.forEach(element => {
                if (element) {
                    element.style.display = '';
                    element.style.visibility = '';
                    element.style.opacity = '';
                }
            });
            
            // Show the map container
            const mapContainer = document.querySelector('.leaflet-container');
            if (mapContainer) {
                mapContainer.style.display = '';
                mapContainer.style.visibility = '';
                mapContainer.style.opacity = '';
            }
        }
        
        // Cleanup function
        return () => {
            const mapElements = document.querySelectorAll('.leaflet-control-container, .leaflet-control-zoom, .leaflet-control-draw, .leaflet-pane, .leaflet-overlay-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane');
            mapElements.forEach(element => {
                if (element) {
                    element.style.display = '';
                    element.style.visibility = '';
                    element.style.opacity = '';
                }
            });
            
            const mapContainer = document.querySelector('.leaflet-container');
            if (mapContainer) {
                mapContainer.style.display = '';
                mapContainer.style.visibility = '';
                mapContainer.style.opacity = '';
            }
        };
    }, [isResultModalOpen]);

    // Add listener for Close button clicks when DiversionManager is open
    React.useEffect(() => {
        if (props.isOpen) {
            const handleCloseButtonClick = () => {
                console.log('🔧 DiversionManager - Close button clicked, hiding map elements');
                // Hide all map elements when close button is clicked
                const mapElements = document.querySelectorAll('.leaflet-control-container, .leaflet-control-zoom, .leaflet-control-draw, .leaflet-pane, .leaflet-overlay-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane');
                mapElements.forEach(element => {
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
    
    return (
        <div className="side-panel-control-component-view d-flex" style={{ 
            zIndex: 9999, 
            position: 'relative',
            ...(isResultModalOpen ? {
                display: 'none',
                visibility: 'hidden',
                opacity: '0'
            } : {})
        }}>
            {console.log('🔧 DiversionManager - SidePanel props.isOpen:', props.isOpen, typeof props.isOpen)}
            {console.log('🔧 DiversionManager - isResultModalOpen:', isResultModalOpen)}
            {console.log('🔧 DiversionManager - shouldShowDiversionManager:', shouldShowDiversionManager)}
            <SidePanel
                isOpen={shouldShowDiversionManager}
                isActive
                className="side-panel-primary-panel side-panel__scroll-size"
                toggleButton={ false }
                style={ isResultModalOpen ? { 
                    display: 'none', 
                    visibility: 'hidden', 
                    opacity: '0',
                    zIndex: '-1'
                } : {} }
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
                    {/* Panel Footer - Always Visible */}
                    <div className="panel-footer">
                        <div className="d-flex justify-content-between align-items-center">
                            <Button
                                className="btn cc-btn-secondary"
                                onClick={ (e) => {
                                    console.log('🔧 Cancel button clicked!');
                                    console.log('🔧 Event:', e);
                                    onCancelClicked();
                                } }
                                style={{ zIndex: 9999 }}
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
                </div>
            </SidePanel>
            {shouldShowDiversionManager && (
                <RouteShapeEditor
                    routeVariant={ selectedBaseRouteVariant }
                    initialShape={ initialBaseRouteShape }
                    additionalRouteVariants={ selectedOtherRouteVariants }
                    highlightedStops={ getUniqueAffectedStopIds(affectedStops) }
                    onShapeUpdated={ onShapeUpdated }
                    visible={ isBaseRouteVariantVisible }
                    className="map" />
            )}
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
            {/* Show result modal for both success and errors */}
            {(() => {
                const isModalOpen = showResultModal || (!props.resultState.isLoading && props.resultState?.error);
                console.log('🔧 DiversionManager - DiversionResultModal isModalOpen:', isModalOpen);
                console.log('🔧 DiversionManager - DiversionResultModal result:', props.resultState?.diversionId ? `Diversion #${props.resultState?.diversionId} has been ${resultAction}.` : null);
                console.log('🔧 DiversionManager - DiversionResultModal error:', props.resultState?.error?.message);
                return (
                    <CustomModal
                        className="diversion-result-modal"
                        title={ title }
                        isModalOpen={ isModalOpen }
                        onClose={ () => {
                            console.log('🔧 DiversionManager - Result modal closed by X button');
                            setShowResultModal(false);
                            // Close the DiversionManager when result modal is closed
                            if (props.onCancelled) {
                                console.log('🔧 DiversionManager - calling onCancelled() for X button close');
                                props.onCancelled();
                            }
                            // Reset the result state
                            props.resetDiversionResult();
                        } }
                        style={{ zIndex: 999999 }}>
                        <DiversionResultModal
                            showNewDiversionButton={ !isEditingMode }
                            result={ props.resultState?.diversionId ? `Diversion #${props.resultState?.diversionId} has been ${resultAction}.` : null }
                            error={ props.resultState?.error?.message }
                            onAction={ handleResultAction }
                        />
                    </CustomModal>
                );
            })()}
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
    onDiversionCreated: PropTypes.func,
    resultState: PropTypes.object,
    diversion: PropTypes.object,
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
}), { createDiversion, updateDiversion, resetDiversionResult })(DiversionManager);
