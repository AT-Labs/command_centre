import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { openDiversionManager, updateDiversionMode, updateDiversionToEdit } from '../../../../../redux/actions/control/diversions';
import { useDiversion as diversionSelector } from '../../../../../redux/selectors/appSettings';
import { getIsDiversionManagerOpen } from '../../../../../redux/selectors/control/diversions';
import EDIT_TYPE from '../../../../../types/edit-types';
import './DiversionsButton.scss';

const DiversionsButton = ({
    disruption,
    openDiversionManagerAction,
    updateDiversionModeAction,
    updateDiversionToEditAction,
    useDiversionFlag,
    onViewDiversions,
    isDiversionManagerOpen,
    toggleEditEffectPanel,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (anchorEl && !event.target.closest('.diversions-button-container')) {
                setAnchorEl(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [anchorEl]);

    // Close dropdown when DiversionManager opens
    useEffect(() => {
        if (isDiversionManagerOpen && anchorEl) {
            setAnchorEl(null);
        }
    }, [isDiversionManagerOpen, anchorEl]);

    // Helper function to get affected entities
    const getAffectedEntities = () => {
        if (!disruption?.affectedEntities) return [];

        // Handle both array and object structures
        if (Array.isArray(disruption.affectedEntities)) {
            return disruption.affectedEntities;
        }

        // Handle object structure with affectedRoutes
        if (disruption.affectedEntities.affectedRoutes) {
            return disruption.affectedEntities.affectedRoutes;
        }

        return [];
    };

    const affectedEntities = getAffectedEntities();
    const diversions = disruption?.diversions || [];
    const diversionCount = diversions.length || 0;
    
    console.log('🔧 DiversionsButton - disruption:', disruption);
    console.log('🔧 DiversionsButton - diversions:', diversions);
    console.log('🔧 DiversionsButton - diversionCount:', diversionCount);

    // Check if Add Diversion should be enabled (same logic as AffectedEntities)
    const isAddDiversionEnabled = () => {
        if (!disruption) return false;

        // Check if disruption is resolved
        const isDisruptionResolved = disruption.status === 'resolved';
        if (isDisruptionResolved) return false;

        // Check if disruption has start and end time
        if (!disruption.startTime || !disruption.endTime) return false;

        // Check if disruption has bus routes
        const isBusRoute = route => route.routeType === 3;
        const hasBusRoutes = affectedEntities.filter(isBusRoute).length > 0;

        return hasBusRoutes;
    };

    // Button is visible only when useDiversion flag is enabled
    if (!useDiversionFlag) {
        return null;
    }

    // Original logic from DisruptionDetail.jsx - addDiversion function
    const handleAddDiversion = () => {
        console.log('🔧 DiversionsButton - handleAddDiversion called');
        console.log('🔧 DiversionsButton - calling updateDiversionModeAction(EDIT_TYPE.CREATE)');
        updateDiversionModeAction(EDIT_TYPE.CREATE);
        console.log('🔧 DiversionsButton - calling openDiversionManagerAction(true)');
        openDiversionManagerAction(true);
        console.log('🔧 DiversionsButton - openDiversionManagerAction(true) called');
        console.log('🔧 DiversionsButton - Redux actions dispatched');
        // Close the EditEffectPanel modal when opening DiversionManager
        if (toggleEditEffectPanel) {
            console.log('🔧 DiversionsButton - calling toggleEditEffectPanel(false)');
            // Delay closing the modal to allow Redux state to update
            setTimeout(() => {
                toggleEditEffectPanel(false);
                console.log('🔧 DiversionsButton - toggleEditEffectPanel(false) called after delay');
            }, 100);
        }
    };

    // Original logic from DisruptionDetail.jsx - viewDiversionsAction
    const handleViewDiversions = () => {
        if (onViewDiversions) {
            onViewDiversions();
        }
    };

    const handleMenuClick = (event) => {
        console.log('🔧 DiversionsButton - handleMenuClick called');
        console.log('🔧 DiversionsButton - event:', event);
        setAnchorEl(event.currentTarget);
    };

    return (
        <div className="diversions-button-container">
            <Button
                variant="contained"
                className="diversions-button"
                onClick={(e) => {
                    console.log('🔧 DiversionsButton - main button clicked!');
                    console.log('🔧 DiversionsButton - event:', e);
                    handleMenuClick(e);
                }}
                disabled={!isAddDiversionEnabled()}
            >
                Diversions({diversionCount})
            </Button>
            
            {console.log('🔧 DiversionsButton - anchorEl:', anchorEl)}
            {console.log('🔧 DiversionsButton - should render dropdown:', anchorEl ? 'YES' : 'NO')}
            {anchorEl && (
                <div className="diversions-menu-dropdown" onClick={(e) => {
                    console.log('🔧 DiversionsButton - dropdown container clicked');
                    e.stopPropagation();
                }}>
                    {console.log('🔧 DiversionsButton - rendering Add Diversion menu item')}
                    <div 
                        className="diversions-menu-item"
                        onMouseDown={(e) => {
                            console.log('🔧 DiversionsButton - Add Diversion mousedown!');
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            console.log('🔧 DiversionsButton - Add Diversion clicked!');
                            console.log('🔧 DiversionsButton - event:', e);
                            console.log('🔧 DiversionsButton - calling handleAddDiversion');
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddDiversion();
                            console.log('🔧 DiversionsButton - handleAddDiversion completed');
                        }}
                        onTouchEnd={(e) => {
                            console.log('🔧 DiversionsButton - Add Diversion touched!');
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddDiversion();
                        }}
                        style={{ 
                            cursor: isAddDiversionEnabled() ? 'pointer' : 'not-allowed',
                            opacity: isAddDiversionEnabled() ? 1 : 0.5
                        }}
                    >
                        Add Diversion
                    </div>
                    <div 
                        className="diversions-menu-item"
                        onClick={handleViewDiversions}
                        style={{ cursor: 'pointer' }}
                    >
                        View & Edit Diversions
                    </div>
                </div>
            )}
        </div>
    );
};

DiversionsButton.propTypes = {
    disruption: PropTypes.object,
    openDiversionManagerAction: PropTypes.func.isRequired,
    updateDiversionModeAction: PropTypes.func.isRequired,
    updateDiversionToEditAction: PropTypes.func.isRequired,
    useDiversionFlag: PropTypes.bool.isRequired,
    onViewDiversions: PropTypes.func,
    isDiversionManagerOpen: PropTypes.bool,
    toggleEditEffectPanel: PropTypes.func,
};

DiversionsButton.defaultProps = {
    disruption: null,
    onViewDiversions: null,
    isDiversionManagerOpen: false,
    toggleEditEffectPanel: null,
};

const mapStateToProps = (state) => ({
    useDiversionFlag: diversionSelector(state),
    isDiversionManagerOpen: getIsDiversionManagerOpen(state),
});

const mapDispatchToProps = (dispatch) => ({
    openDiversionManagerAction: (isOpen) => dispatch(openDiversionManager(isOpen)),
    updateDiversionModeAction: (mode) => dispatch(updateDiversionMode(mode)),
    updateDiversionToEditAction: (diversion) => dispatch(updateDiversionToEdit(diversion)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiversionsButton);
