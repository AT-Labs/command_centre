import PropTypes from 'prop-types';

export const IncidentType = PropTypes.shape({
    incidentId: PropTypes.number.isRequired,
    incidentCauseNo: PropTypes.string.isRequired,
    incidentTitle: PropTypes.string.isRequired,
    impact: PropTypes.string.isRequired,
    affectedEntities: PropTypes.array.isRequired,
});
