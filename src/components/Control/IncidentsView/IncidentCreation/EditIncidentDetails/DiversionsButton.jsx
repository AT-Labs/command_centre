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
    refreshDiversions,
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

    // Refresh diversions data when component mounts or when refreshDiversions function changes
    useEffect(() => {
        if (refreshDiversions) {
            refreshDiversions();
        }
    }, [refreshDiversions]);

    // Refresh diversions when DiversionManager closes (after creating a diversion)
    useEffect(() => {
        if (!isDiversionManagerOpen && refreshDiversions) {
            // Add a small delay to ensure the diversion was created
            setTimeout(() => {
                refreshDiversions();
            }, 500);
        }
    }, [isDiversionManagerOpen, refreshDiversions]);

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

    const isAddDiversionEnabled = () => {
        if (!disruption) return false;

        // Add Diversion is enabled when:
        // - Disruption is not-started, in-progress, or draft status
        const allowedStatuses = ['not-started', 'in-progress', 'draft'];
        const isStatusAllowed = allowedStatuses.includes(disruption.status);
        if (!isStatusAllowed) return false;

        // - Disruption has start and end time
        if (!disruption.startTime || !disruption.endTime) return false;

        // - Disruption has at least one bus route
        const isBusRoute = route => route.routeType === 3; // Bus route type
        const isTrainRoute = route => route.routeType === 1; // Train route type
        const busRoutes = affectedEntities.filter(isBusRoute);
        const trainRoutes = affectedEntities.filter(isTrainRoute);

        // Must have at least one bus route
        if (busRoutes.length === 0) return false;

        // Disable if disruption contains only train routes (no bus routes)
        if (trainRoutes.length > 0 && busRoutes.length === 0) return false;

        return true;
    };

    // Button is visible only when useDiversion flag is enabled
    if (!useDiversionFlag) {
        return null;
    }

    // Original logic from DisruptionDetail.jsx - addDiversion function
    const handleAddDiversion = () => {
        updateDiversionModeAction(EDIT_TYPE.CREATE);
        openDiversionManagerAction(true);
        // Close the EditEffectPanel modal when opening DiversionManager
        if (toggleEditEffectPanel) {
            // Delay closing the modal to allow Redux state to update
            setTimeout(() => {
                toggleEditEffectPanel(false);
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
        setAnchorEl(event.currentTarget);
    };

    return (
        <div className="diversions-button-container">
            <Button
                variant="contained"
                className="diversions-button"
                onClick={(e) => {
                    handleMenuClick(e);
                }}
                // Button is always enabled, but Add Diversion option can be disabled
                disabled={false}
            >
                Diversions({diversionCount})
            </Button>
            
            {anchorEl && (
                <div className="diversions-menu-dropdown" onClick={(e) => {
                    e.stopPropagation();
                }}>
                    <div 
                        className="diversions-menu-item"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isAddDiversionEnabled()) {
                                handleAddDiversion();
                            }
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isAddDiversionEnabled()) {
                                handleAddDiversion();
                            }
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
    refreshDiversions: PropTypes.func,
};

DiversionsButton.defaultProps = {
    disruption: null,
    onViewDiversions: null,
    isDiversionManagerOpen: false,
    toggleEditEffectPanel: null,
    refreshDiversions: null,
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
