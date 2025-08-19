import React from 'react';
import { Button } from '@mui/material';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import detourIcon from '../../../../../assets/img/detour.svg';
import { openDiversionManager, updateDiversionMode, fetchDiversions, clearDiversionsCache } from '../../../../../redux/actions/control/diversions';
import { useDiversion as diversionSelector } from '../../../../../redux/selectors/appSettings';
import { getIsDiversionManagerOpen, getDiversionsForDisruption, getDiversionResultState } from '../../../../../redux/selectors/control/diversions';
import EDIT_TYPE from '../../../../../types/edit-types';
import { useDiversionsLogic, useAffectedEntities, useDiversionValidation } from './useDiversionsLogic';
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
    clearDiversionsCacheAction,
}) => {
    const diversionResultState = getDiversionResultState(state);
    const { anchorEl, setAnchorEl } = useDiversionsLogic(disruption, fetchDiversionsAction, isDiversionManagerOpen, diversionResultState, clearDiversionsCacheAction);

    const affectedEntities = useAffectedEntities(disruption);

    const diversions = getDiversionsForDisruption(disruption?.disruptionId)(state) || [];
    const diversionCount = diversions.length || 0;

    const isAddDiversionEnabled = useDiversionValidation(disruption, affectedEntities, diversions);

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
                            if (isAddDiversionEnabled) {
                                handleAddDiversion();
                            }
                        } }
                        onTouchEnd={ (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isAddDiversionEnabled) {
                                handleAddDiversion();
                            }
                        } }
                        onKeyDown={ (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (isAddDiversionEnabled) {
                                    handleAddDiversion();
                                }
                            }
                        } }
                        style={ {
                            cursor: isAddDiversionEnabled ? 'pointer' : 'not-allowed',
                            opacity: isAddDiversionEnabled ? 1 : 0.5,
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
    clearDiversionsCacheAction: PropTypes.func,
};

DiversionsButton.defaultProps = {
    disruption: null,
    onViewDiversions: null,
    isDiversionManagerOpen: false,
    toggleEditEffectPanel: null,
    state: null,
    fetchDiversionsAction: null,
    clearDiversionsCacheAction: null,
};

const mapStateToProps = state => ({
    useDiversionFlag: diversionSelector(state),
    isDiversionManagerOpen: getIsDiversionManagerOpen(state),
    state,
});

const mapDispatchToProps = dispatch => ({
    openDiversionManagerAction: isOpen => dispatch(openDiversionManager(isOpen)),
    updateDiversionModeAction: mode => dispatch(updateDiversionMode(mode)),
    fetchDiversionsAction: (disruptionId, forceRefresh) => dispatch(fetchDiversions(disruptionId, forceRefresh)),
    clearDiversionsCacheAction: disruptionId => dispatch(clearDiversionsCache(disruptionId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiversionsButton);
