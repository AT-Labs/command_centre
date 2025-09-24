import ERROR_TYPE from './error-types';
import { ALERT_ERROR_MESSAGE_TYPE } from './message-types';

export const STATUSES = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
    DRAFT: 'draft',
};

export const ACTION_RESULT_TYPES = {
    SUCCESS: 'success',
    ERROR: 'danger',
};

export const ACTION_RESULT = {
    UPDATE_SUCCESS: (incidentNo, createNotification = false) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Disruption ${incidentNo} has been updated.`,
        resultCreateNotification: createNotification,
    }),
    UPDATE_ERROR: incidentNo => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.disruptionUpdate(incidentNo),
    }),
    CREATE_SUCCESS: (incidentNo, version, createNotification = false) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Disruption number #${incidentNo} created successfully.`,
        resultCreateNotification: createNotification,
        resultDisruptionVersion: version,
    }),
    COPY_SUCCESS: (incidentNo, version, createNotification, sourceDisruptionID = false) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Disruption #${incidentNo} copied from #${sourceDisruptionID}`,
        resultCreateNotification: createNotification,
        resultDisruptionVersion: version,
    }),
    SAVE_DRAFT_SUCCESS: (incidentNo, createNotification = false) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Draft disruption number #${incidentNo} saved successfully.`,
        resultCreateNotification: createNotification,
    }),
    CREATE_ERROR: () => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.disruptionCreate,
    }),
    PUBLISH_DRAFT_SUCCESS: (incidentNo, version, createNotification = false) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Draft disruption number #${incidentNo} published successfully.`,
        resultCreateNotification: createNotification,
        resultDisruptionVersion: version,
    }),
    PUBLISH_DRAFT_ERROR: () => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.draftDisruptionPublish,
    }),
};

export const DISRUPTION_TYPE = {
    ROUTES: 'Routes',
    STOPS: 'Stops',
};

export const ALERT_TYPES = {
    STOP_SELECTION_DISABLED_ERROR: () => ({
        type: ALERT_ERROR_MESSAGE_TYPE,
        body: 'It is not possible to add stops to a route-based disruption via the map.',
    }),
};

export const WORKAROUND_TYPES = {
    all: { key: 'all', value: 'Workaround for all' },
    route: { key: 'route', value: 'Workaround by Route' },
    stop: { key: 'stop', value: 'Workaround by Stop' },
};

export const DISRUPTION_CREATION_STEPS = {
    SEARCH_ROUTES_STOPS: 'Search routes or stops',
    ENTER_DETAILS: 'Enter Details',
    ADD_WORKAROUNDS: 'Add Workarounds',
};

export const INCIDENTS_CREATION_STEPS = {
    ENTER_DETAILS: 'Enter Details',
    ADD_EFFECTS: 'Add Effects',
    ADD_WORKAROUNDS: 'Add Workarounds',
};

export const DISRUPTIONS_MESSAGE_TYPE = {
    noWorkaroundsMessage: 'No workarounds added for this disruption.',
    noNotesMessage: 'No notes added to this disruption',
    noDiversionsMessage: 'No diversions added to this disruption.',
};

export const DEFAULT_SEVERITY = {
    label: '',
    value: '',
};

export const SEVERITIES = [
    DEFAULT_SEVERITY,
    {
        label: '5 (Catastrophic)',
        value: 'CATASTROPHIC',
    },
    {
        label: '4 (Headline)',
        value: 'HEADLINE',
    },
    {
        label: '3 (Serious)',
        value: 'SERIOUS',
    },
    {
        label: '2 (Significant)',
        value: 'SIGNIFICANT',
    },
    {
        label: '1 (Minor)',
        value: 'MINOR',
    },
    {
        label: 'Unknown',
        value: 'UNKNOWN',
    },
];

export const PASSENGER_IMPACT_RANGE = {
    LOWER_THAN_500: '<500',
    BETWEEN_500_5000: '500 - 5,000',
    BETWEEN_5001_15000: '5,001 - 15,000',
    BETWEEN_15001_40000: '15,001 - 40,000',
    GREATER_THAN_40000: '>40,000',
};

export const WEEKDAYS = [
    'M',
    'Tu',
    'W',
    'Th',
    'F',
    'Sa',
    'Su',
];
