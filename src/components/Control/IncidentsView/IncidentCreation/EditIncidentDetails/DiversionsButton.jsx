import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemText } from '@mui/material';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { openDiversionManager, updateDiversionMode, updateDiversionToEdit } from '../../../../../redux/actions/control/diversions';
import { useDiversion as diversionSelector } from '../../../../../redux/selectors/appSettings';
import './DiversionsButton.scss';

const DiversionsButton = ({
    disruption,
    openDiversionManagerAction,
    updateDiversionModeAction,
    updateDiversionToEditAction,
    useDiversionFlag,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);

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

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAddDiversion = () => {
        if (isAddDiversionEnabled()) {
            updateDiversionModeAction('CREATE');
            updateDiversionToEditAction(null);
            openDiversionManagerAction(true);
        }
        handleClose();
    };

    const handleViewDiversions = () => {
        // TODO: Implement view diversions functionality
        // This should open the ViewDiversionDetailModal
        handleClose();
    };

    if (!useDiversionFlag) {
        return null;
    }

    return (
        <div className="diversions-button-container">
            <Button
                variant="contained"
                color="primary"
                onClick={ handleClick }
                className="diversions-button"
            >
                Diversions(
                { diversionCount }
                )
            </Button>
            <Menu
                anchorEl={ anchorEl }
                open={ Boolean(anchorEl) }
                onClose={ handleClose }
                className="diversions-menu"
            >
                <MenuItem
                    onClick={ handleAddDiversion }
                    disabled={ !isAddDiversionEnabled() }
                    className="diversions-menu-item"
                >
                    <ListItemText primary="Add Diversion" />
                </MenuItem>
                <MenuItem
                    onClick={ handleViewDiversions }
                    className="diversions-menu-item"
                >
                    <ListItemText primary="View & Edit Diversions" />
                </MenuItem>
            </Menu>
        </div>
    );
};

DiversionsButton.propTypes = {
    disruption: PropTypes.object,
    openDiversionManagerAction: PropTypes.func.isRequired,
    updateDiversionModeAction: PropTypes.func.isRequired,
    updateDiversionToEditAction: PropTypes.func.isRequired,
    useDiversionFlag: PropTypes.bool.isRequired,
};

DiversionsButton.defaultProps = {
    disruption: null,
};

const mapStateToProps = state => ({
    useDiversionFlag: diversionSelector(state),
});

const mapDispatchToProps = {
    openDiversionManagerAction: openDiversionManager,
    updateDiversionModeAction: updateDiversionMode,
    updateDiversionToEditAction: updateDiversionToEdit,
};

export default connect(mapStateToProps, mapDispatchToProps)(DiversionsButton);
