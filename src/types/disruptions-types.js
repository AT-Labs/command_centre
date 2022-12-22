import ERROR_TYPE from './error-types';
import { ALERT_ERROR_MESSAGE_TYPE } from './message-types';

export const STATUSES = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
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
    CREATE_SUCCESS: (incidentNo, createNotification = false) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Disruption number #${incidentNo} created successfully.`,
        resultCreateNotification: createNotification,
    }),
    COPY_SUCCESS: (incidentNo, createNotification, sourceDisruptionID = false) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Disruption #${incidentNo} copied from #${sourceDisruptionID}`,
        resultCreateNotification: createNotification,
    }),
    CREATE_ERROR: () => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.disruptionCreate,
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

export const DISRUPTIONS_MESSAGE_TYPE = {
    noWorkaroundsMessage: 'No workarounds added for this disruption.',
    noNotesMessage: 'No notes added to this disruption',
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
