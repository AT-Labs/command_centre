import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { openDiversionManager, updateDiversionMode, updateDiversionToEdit } from '../../../../../redux/actions/control/diversions';
import { useDiversion as diversionSelector } from '../../../../../redux/selectors/appSettings';
import EDIT_TYPE from '../../../../../types/edit-types';
import './DiversionsButton.scss';

const DiversionsButton = ({
    disruption,
    openDiversionManagerAction,
    updateDiversionModeAction,
    updateDiversionToEditAction,
    useDiversionFlag,
    onViewDiversions,
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
        console.log('🔧 ===== ADD DIVERSION CLICKED =====');
        console.log('🔧 disruption:', disruption);
        console.log('🔧 isAddDiversionEnabled:', isAddDiversionEnabled);
        
        updateDiversionModeAction(EDIT_TYPE.CREATE);
        openDiversionManagerAction(true);
        
        console.log('🔧 Called updateDiversionModeAction and openDiversionManagerAction');
        console.log('🔧 ===== END ADD DIVERSION CLICK =====');
    };

    // Original logic from DisruptionDetail.jsx - viewDiversionsAction
    const handleViewDiversions = () => {
        console.log('🔧 ===== VIEW DIVERSIONS CLICKED =====');
        console.log('🔧 disruption:', disruption);
        console.log('🔧 onViewDiversions function:', typeof onViewDiversions);
        
        if (onViewDiversions) {
            onViewDiversions();
            console.log('🔧 Called onViewDiversions');
        } else {
            console.log('🔧 onViewDiversions is not defined');
        }
        
        console.log('🔧 ===== END VIEW DIVERSIONS CLICK =====');
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    return (
        <div className="diversions-button-container">
            <Button
                variant="contained"
                className="diversions-button"
                onClick={handleMenuClick}
                disabled={!isAddDiversionEnabled()}
            >
                Diversions({diversionCount})
            </Button>
            
            {anchorEl && (
                <div className="diversions-menu-dropdown">
                    <div 
                        className="diversions-menu-item"
                        onClick={handleAddDiversion}
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
};

DiversionsButton.defaultProps = {
    disruption: null,
    onViewDiversions: null,
};

const mapStateToProps = (state) => ({
    useDiversionFlag: diversionSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
    openDiversionManagerAction: (isOpen) => dispatch(openDiversionManager(isOpen)),
    updateDiversionModeAction: (mode) => dispatch(updateDiversionMode(mode)),
    updateDiversionToEditAction: (diversion) => dispatch(updateDiversionToEdit(diversion)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiversionsButton);
