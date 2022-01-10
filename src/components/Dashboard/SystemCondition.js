import PropTypes from 'prop-types';


const period = PropTypes.shape({
    id: PropTypes.number.isRequired,
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date),
    isUp: PropTypes.bool,
    duration: PropTypes.number.isRequired,
});

export const systemCondition = PropTypes.shape({
    applicationName: PropTypes.string.isRequired,
    applicationId: PropTypes.number.isRequired,
    description: PropTypes.string,
    periods: PropTypes.arrayOf(period),
});
