import PropTypes from 'prop-types';

export const IncidentType = PropTypes.shape({
    incidentId: PropTypes.number.isRequired,
    incidentDisruptionNo: PropTypes.string.isRequired,
    incidentTitle: PropTypes.string.isRequired,
    impact: PropTypes.string.isRequired,
    affectedEntities: PropTypes.array.isRequired,
});

export const confirmationModalTypes = {
    NONE: 'none',
    EDIT: 'edit',
    COPY: 'copy',
    CHANGE_DISRUPTION_TYPE: 'changeDisruptionType',
    REMOVE_SELECTED_ENTITY: 'removeSelectedEntity',
    RESET_SELECTED_ENTITIES: 'resetSelectedEntities',
};

export const PAGE_SIZE = 25;

export const DIRECTIONS = {
    0: 'Inbound/Anticlockwise',
    1: 'Outbound/Clockwise',
};
