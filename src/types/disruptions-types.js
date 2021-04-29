import ERROR_TYPE from './error-types';

export const STATUSES = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
};

export const DEFAULT_CAUSE = {
    label: '',
    value: '',
};

export const CAUSES = [
    DEFAULT_CAUSE,
    {
        label: 'Technical Problem',
        value: 'TECHNICAL_PROBLEM',
    },
    {
        label: 'Strike',
        value: 'STRIKE',
    },
    {
        label: 'Demonstration',
        value: 'DEMONSTRATION',
    },
    {
        label: 'Accident',
        value: 'ACCIDENT',
    },
    {
        label: 'Holiday',
        value: 'HOLIDAY',
    },
    {
        label: 'Weather',
        value: 'WEATHER',
    },
    {
        label: 'Maintenance',
        value: 'MAINTENANCE',
    },
    {
        label: 'Construction',
        value: 'CONSTRUCTION',
    },
    {
        label: 'Police Activity',
        value: 'POLICE_ACTIVITY',
    },
    {
        label: 'Medical Emergency',
        value: 'MEDICAL_EMERGENCY',
    },
    {
        label: 'Unknown Cause',
        value: 'UNKNOWN_CAUSE',
    },
    {
        label: 'Other Cause (not represented by any of these options)',
        value: 'OTHER_CAUSE',
    },
];

export const DEFAULT_IMPACT = {
    label: '',
    value: '',
};

export const IMPACTS = [
    DEFAULT_IMPACT,
    {
        label: 'No service',
        value: 'NO_SERVICE',
    },
    {
        label: 'Reduced service',
        value: 'REDUCED_SERVICE',
    },
    {
        label: 'Significant delays',
        value: 'SIGNIFICANT_DELAYS',
    },
    {
        label: 'Detour',
        value: 'DETOUR',
    },
    {
        label: 'Additional services',
        value: 'ADDITIONAL_SERVICE',
    },
    {
        label: 'Modified service',
        value: 'MODIFIED_SERVICE',
    },
    {
        label: 'Stop moved',
        value: 'STOP_MOVED',
    },
    {
        label: 'Other effect (not represented by any of these options)',
        value: 'OTHER_EFFECT',
    },
    {
        label: 'Unknown effect',
        value: 'UNKNOWN_EFFECT',
    },
];

export const ACTION_RESULT_TYPES = {
    SUCCESS: 'success',
    ERROR: 'danger',
};

export const ACTION_RESULT = {
    UPDATE_SUCCESS: incidentNo => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Disruption ${incidentNo} has been updated.`,
    }),
    UPDATE_ERROR: incidentNo => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.disruptionUpdate(incidentNo),
    }),
    CREATE_SUCCESS: incidentNo => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Disruption with disrupt number #${incidentNo} created successfully.`,
    }),
    CREATE_ERROR: () => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.disruptionCreate,
    }),
};
