import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import detourIcon from '../../../../../assets/img/detour.svg';
import { openDiversionManager, updateDiversionMode, fetchDiversions } from '../../../../../redux/actions/control/diversions';
import { useDiversion as diversionSelector } from '../../../../../redux/selectors/appSettings';
import { getIsDiversionManagerOpen, getDiversionsForDisruption } from '../../../../../redux/selectors/control/diversions';
import EDIT_TYPE from '../../../../../types/edit-types';
import './DiversionsButton.scss';

const DiversionsButton = ({
    disruption,
    openDiversionManagerAction,
    updateDiversionModeAction,
    useDiversionFlag,
    onViewDiversions,
    isDiversionManagerOpen,
    toggleEditEffectPanel,
    state,
    fetchDiversionsAction,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);

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

    useEffect(() => {
        if (isDiversionManagerOpen && anchorEl) {
            setAnchorEl(null);
        }
    }, [isDiversionManagerOpen, anchorEl]);

    useEffect(() => {
        if (disruption?.disruptionId && fetchDiversionsAction) {
            fetchDiversionsAction(disruption.disruptionId);
        }
    }, [disruption?.disruptionId, fetchDiversionsAction]);

    useEffect(() => {
        if (!isDiversionManagerOpen && disruption?.disruptionId && fetchDiversionsAction) {
            setTimeout(() => {
                fetchDiversionsAction(disruption.disruptionId);
            }, 500);
        }
    }, [isDiversionManagerOpen, disruption?.disruptionId, fetchDiversionsAction]);

    const getAffectedEntities = () => {
        if (!disruption?.affectedEntities) return [];

        if (Array.isArray(disruption.affectedEntities)) {
            return disruption.affectedEntities;
        }

        if (disruption.affectedEntities.affectedRoutes) {
            return disruption.affectedEntities.affectedRoutes;
        }

        return [];
    };

    const affectedEntities = getAffectedEntities();

    const diversions = getDiversionsForDisruption(disruption?.disruptionId)(state) || [];
    const diversionCount = diversions.length || 0;

    const isAddDiversionEnabled = () => {
        if (!disruption) {
            return false;
        }

        const allowedStatuses = ['not-started', 'in-progress', 'draft'];
        const isStatusAllowed = allowedStatuses.includes(disruption.status);
        if (!isStatusAllowed) return false;

        if (!disruption.startTime || !disruption.endTime) {
            return false;
        }

        const isBusRoute = route => route.routeType === 3;
        const isTrainRoute = route => route.routeType === 1;
        const busRoutes = affectedEntities.filter(isBusRoute);
        const trainRoutes = affectedEntities.filter(isTrainRoute);

        if (busRoutes.length === 0) {
            return false;
        }

        if (trainRoutes.length > 0 && busRoutes.length === 0) {
            return false;
        }

        const existingDiversions = diversions || [];

        const busRoutesWithDiversions = busRoutes.filter(route => existingDiversions.some((diversion) => {
            const diversionRouteVariants = diversion.diversionRouteVariants || [];
            return diversionRouteVariants.some(drv => drv.routeId === route.routeId);
        }));

        if (busRoutesWithDiversions.length === busRoutes.length) {
            return false;
        }

        return true;
    };

    if (!useDiversionFlag) {
        return null;
    }

    const handleAddDiversion = () => {
        updateDiversionModeAction(EDIT_TYPE.CREATE);
        openDiversionManagerAction(true);
        if (toggleEditEffectPanel) {
            setTimeout(() => {
                toggleEditEffectPanel(false);
            }, 100);
        }
    };

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
                onClick={ handleMenuClick }
                disabled={ false }
            >
                <span style={ { color: '#000000' } }>
                    Diversions(
                    {diversionCount}
                    )
                </span>
                <img
                    src={ detourIcon }
                    alt="detour"
                    width="26"
                    height="26"
                    style={ { marginLeft: '8px' } }
                />
            </Button>

            {anchorEl && (
                <div
                    className="diversions-menu-dropdown"
                    onClick={ (e) => {
                        e.stopPropagation();
                    } }
                    onKeyDown={ (e) => {
                        if (e.key === 'Escape') {
                            setAnchorEl(null);
                        }
                    } }
                    role="menu"
                    tabIndex={ -1 }
                >
                    <div
                        className="diversions-menu-item"
                        role="menuitem"
                        tabIndex={ 0 }
                        onMouseDown={ (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        } }
                        onClick={ (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isAddDiversionEnabled()) {
                                handleAddDiversion();
                            }
                        } }
                        onTouchEnd={ (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isAddDiversionEnabled()) {
                                handleAddDiversion();
                            }
                        } }
                        onKeyDown={ (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (isAddDiversionEnabled()) {
                                    handleAddDiversion();
                                }
                            }
                        } }
                        style={ {
                            cursor: isAddDiversionEnabled() ? 'pointer' : 'not-allowed',
                            opacity: isAddDiversionEnabled() ? 1 : 0.5,
                        } }
                    >
                        Add Diversion
                    </div>
                    <div
                        className="diversions-menu-item"
                        role="menuitem"
                        tabIndex={ 0 }
                        onClick={ handleViewDiversions }
                        onKeyDown={ (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleViewDiversions();
                            }
                        } }
                        style={ { cursor: 'pointer' } }
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
    useDiversionFlag: PropTypes.bool.isRequired,
    onViewDiversions: PropTypes.func,
    isDiversionManagerOpen: PropTypes.bool,
    toggleEditEffectPanel: PropTypes.func,
    state: PropTypes.object,
    fetchDiversionsAction: PropTypes.func,
};

DiversionsButton.defaultProps = {
    disruption: null,
    onViewDiversions: null,
    isDiversionManagerOpen: false,
    toggleEditEffectPanel: null,
    state: null,
    fetchDiversionsAction: null,
};

const mapStateToProps = state => ({
    useDiversionFlag: diversionSelector(state),
    isDiversionManagerOpen: getIsDiversionManagerOpen(state),
    state,
});

const mapDispatchToProps = dispatch => ({
    openDiversionManagerAction: isOpen => dispatch(openDiversionManager(isOpen)),
    updateDiversionModeAction: mode => dispatch(updateDiversionMode(mode)),
    fetchDiversionsAction: disruptionId => dispatch(fetchDiversions(disruptionId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiversionsButton);
