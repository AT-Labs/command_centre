import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';
import { Paper, Stack } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { isEmpty, sortBy, some, isEqual } from 'lodash-es';
import { Form, FormFeedback, FormGroup, Input, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { FaRegCalendarAlt } from 'react-icons/fa';
import Flatpickr from 'react-flatpickr';
import { RRule } from 'rrule';
import moment from 'moment';

import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import HistoryIcon from '@mui/icons-material/History';
import { isEditEffectPanelOpen,
    isWorkaroundPanelOpen,
    getRequestedDisruptionKeyToUpdateEditEffect,
    isCancellationEffectModalOpen,
} from '../../../../../redux/selectors/control/incidents';
import { DisruptionDetailSelect } from '../../../DisruptionsView/DisruptionDetail/DisruptionDetailSelect';
import {
    LABEL_CUSTOMER_IMPACT,
    LABEL_START_DATE,
    DATE_FORMAT,
    TIME_FORMAT,
    LABEL_END_DATE,
    LABEL_END_TIME,
    LABEL_START_TIME,
    LABEL_SEVERITY,
    LABEL_DURATION_HOURS,
    LABEL_HEADER,
    HEADER_MAX_LENGTH,
    LABEL_STATUS,
    LABEL_DISRUPTION_NOTES,
    DESCRIPTION_NOTE_MAX_LENGTH } from '../../../../../constants/disruptions';
import {
    isEndDateValid,
    isDurationValid,
    getRecurrenceDates,
    getStatusOptions,
    formatCreatedUpdatedTime,
    momentFromDateTime,
    isEffectEndTimeValid,
    updateParentDisruptionTimeRange,
} from '../../../../../utils/control/disruptions';
import {
    generateActivePeriodsFromRecurrencePattern,
    parseRecurrencePattern,
    isActivePeriodsValid } from '../../../../../utils/recurrence';
import { DISRUPTION_TYPE, SEVERITIES, DEFAULT_SEVERITY, STATUSES } from '../../../../../types/disruptions-types';
import SelectEffectEntities from '../WizardSteps/SelectEffectEntities';
import {
    toggleEditEffectPanel,
    updateDisruptionKeyToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    updateDisruption as updateDisruptionAction,
    getRoutesByShortName,
    updateAffectedStopsState,
    updateAffectedRoutesState,
    setRequireToUpdateWorkaroundsState,
    setDisruptionForWorkaroundEdit,
    toggleIncidentModals,
} from '../../../../../redux/actions/control/incidents';
import { useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { getDatePickerOptions } from '../../../../../utils/dateUtils';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import HistoryNotesModal from './HistoryNotesModal';
import { shareToEmail } from '../../../../../utils/control/disruption-sharing';
import CustomMuiDialog from '../../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../../Common/ActivePeriods/ActivePeriods';
import DisruptionSummaryModal from './DisruptionSummaryModal';
import CancellationEffect from './CancellationEffect';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import HeaderButtons from './HeaderButtons';
import ViewDiversionDetailModal from './ViewDiversionDetailModal';
import EDIT_TYPE from '../../../../../types/edit-types';
import './EditEffectPanel.scss';
import { getDiversionsForDisruption, getDiversionsLoadingForDisruption } from '../../../../../redux/selectors/control/diversions';
import { fetchDiversions, clearDiversionsCache, deleteDiversion } from '../../../../../redux/actions/control/diversions';
import AddNoteModal from './AddNoteModal';
import { useDisruptionNotePopup } from '../../../../../redux/selectors/appSettings';

const INIT_EFFECT_STATE = {
    key: '',
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    impact: DEFAULT_IMPACT.value,
    cause: DEFAULT_CAUSE.value,
    disruptionType: DISRUPTION_TYPE.ROUTES,
    affectedEntities: {
        affectedRoutes: [],
        affectedStops: [],
    },
    createNotification: false,
    severity: DEFAULT_SEVERITY.value,
    recurrent: false,
    duration: '',
    recurrencePattern: { freq: RRule.WEEKLY },
    isRecurrencePatternDirty: false,
    header: '',
    incidentNo: '',
    note: '',
    notes: [],
    status: STATUSES.NOT_STARTED,
};

export const EditEffectPanel = (props) => {
    const { disruptions, disruptionIncidentNoToEdit, disruptionRecurrent, modalOpenedTime } = props;

    const [disruption, setDisruption] = useState({ ...INIT_EFFECT_STATE });
    const [originalDisruption, setOriginalDisruption] = useState({});

    // Ensure disruption has required properties
    const safeDisruption = React.useMemo(() => ({
        ...INIT_EFFECT_STATE,
        ...(disruption || {}),
        affectedEntities: (disruption && disruption.affectedEntities) || { affectedRoutes: [], affectedStops: [] },
        diversions: props.disruptions?.[0]?.diversions || [],
    }), [disruption, props.disruptions]);

    // Get centralized diversions data
    const diversions = getDiversionsForDisruption(safeDisruption?.disruptionId || safeDisruption?.incidentId)(props.state) || [];
    const isLoadingDiversions = getDiversionsLoadingForDisruption(safeDisruption?.disruptionId || safeDisruption?.incidentId)(props.state) || false;

    const [now] = useState(moment().second(0).millisecond(0));
    const [activePeriods, setActivePeriods] = useState([]);
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);
    const [isStartTimeDirty, setIsStartTimeDirty] = useState(false);
    const [isTitleDirty, setIsTitleDirty] = useState(false);
    const [isStartDateDirty, setIsStartDateDirty] = useState(false);
    const [isEndDateDirty, setIsEndDateDirty] = useState(false);
    const [isImpactDirty, setIsImpactDirty] = useState(false);
    const [isSeverityDirty, setIsSeverityDirty] = useState(false);
    const [isDurationDirty, setIsDurationDirty] = useState(false);

    const [historyNotesModalOpen, setHistoryNotesModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [requireMapUpdate, setRequireMapUpdate] = useState(false);
    const [disruptionsDetailsModalOpen, setDisruptionsDetailsModalOpen] = useState(false);
    const [isViewDiversionsModalOpen, setIsViewDiversionsModalOpen] = useState(false);
    const [shouldRefetchDiversions, setShouldRefetchDiversions] = useState(false);

    // Add useEffect to track isViewDiversionsModalOpen changes
    useEffect(() => {
        if (isViewDiversionsModalOpen && safeDisruption?.disruptionId) {
            props.fetchDiversions(safeDisruption.disruptionId);
        }
    }, [isViewDiversionsModalOpen, safeDisruption?.disruptionId, props.fetchDiversions]);

    // Refresh diversions when shouldRefetchDiversions changes
    useEffect(() => {
        if (shouldRefetchDiversions && safeDisruption?.disruptionId) {
            props.fetchDiversions(safeDisruption.disruptionId, true);
        }
    }, [shouldRefetchDiversions, safeDisruption?.disruptionId, props.fetchDiversions]);

    // Fetch diversions when disruption changes
    useEffect(() => {
        if (disruption?.disruptionId && !isLoadingDiversions) {
            // Use centralized diversions data
            props.fetchDiversions(disruption.disruptionId);
        }
    }, [disruption?.disruptionId, shouldRefetchDiversions, props.fetchDiversions, isLoadingDiversions]);

    // Function to refresh diversions data
    const refreshDiversions = useCallback(async () => {
        if (disruption?.disruptionId && !isLoadingDiversions) {
            // Add additional protection against multiple calls
            const currentTime = Date.now();
            if (refreshDiversions.lastCall && (currentTime - refreshDiversions.lastCall) < 5000) {
                return;
            }
            refreshDiversions.lastCall = currentTime;

            try {
                // Clear cache and fetch fresh data
                props.clearDiversionsCache(disruption.disruptionId);
                await props.fetchDiversions(disruption.disruptionId);
            } catch (error) {
                // Error refreshing diversions
            }
        }
    }, [disruption?.disruptionId, isLoadingDiversions, props.clearDiversionsCache, props.fetchDiversions]);

    const startTimeValid = () => isEffectEndTimeValid(
        safeDisruption.startDate,
        safeDisruption.startTime,
        safeDisruption.endDate,
        safeDisruption.endTime,
        disruptionRecurrent,
    );

    const impactValid = () => !isEmpty(safeDisruption.impact);
    const severityValid = () => !isEmpty(safeDisruption.severity);

    const durationValid = () => isDurationValid(safeDisruption.duration, disruptionRecurrent);
    const endTimeValid = () => isEffectEndTimeValid(
        safeDisruption.endDate,
        safeDisruption.endTime,
        safeDisruption.startDate,
        safeDisruption.startTime,
    );
    const endDateValid = () => isEndDateValid(safeDisruption.endDate, safeDisruption.startDate, disruptionRecurrent);

    const startDateValid = () => isEndDateValid(safeDisruption.startDate, moment(modalOpenedTime), disruptionRecurrent);

    const isDateTimeValid = () => startTimeValid() && startDateValid() && endDateValid() && durationValid();

    const titleValid = () => !isEmpty(safeDisruption.header);

    const datePickerOptions = getDatePickerOptions();

    const endDateDatePickerOptions = () => getDatePickerOptions(safeDisruption.startDate || moment().second(0).millisecond(0));

    const updateDisruption = (updatedFields) => {
        let recurrenceDates;
        let parsedRecurrencePattern;
        if (updatedFields?.startDate || updatedFields?.startTime || updatedFields?.endDate || updatedFields?.recurrent) {
            recurrenceDates = getRecurrenceDates(
                updatedFields.startDate || safeDisruption.startDate,
                updatedFields.startTime || safeDisruption.startTime,
                updatedFields.endDate || safeDisruption.endDate,
            );
            parsedRecurrencePattern = safeDisruption.recurrent ? parseRecurrencePattern(safeDisruption.recurrencePattern) : { freq: RRule.WEEKLY };
        }

        const updatedDisruption = {
            ...disruption,
            ...updatedFields,
            ...(recurrenceDates && {
                recurrencePattern: {
                    ...disruption.recurrencePattern,
                    ...parsedRecurrencePattern,
                    ...recurrenceDates,
                },
            }),
        };

        setDisruption(updatedDisruption);

        // Automatically update Parent Disruption time range if this Effect timing changes
        if (updatedFields?.startDate || updatedFields?.startTime || updatedFields?.endDate || updatedFields?.endTime) {
            const updatedEffects = props.disruptions.map(d => (d.incidentNo === safeDisruption.incidentNo ? updatedDisruption : d));
            updateParentDisruptionTimeRange(
                props.disruptions[0],
                updatedEffects,
            );

            if (props.onDisruptionsUpdate) {
                props.onDisruptionsUpdate(updatedEffects);
            }
        }
    };

    const onChangeStartDate = (date) => {
        if (date.length === 0) {
            updateDisruption({ startDate: '' });
            setIsStartDateDirty(true);
        } else {
            updateDisruption({ startDate: moment(date[0]).format(DATE_FORMAT) });
            setIsStartDateDirty(false);
        }
    };

    const onChangeEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0) {
                updateDisruption({ endDate: '', isEndDateDirty: false });
            } else {
                updateDisruption({ isEndDateDirty: true });
                setIsEndDateDirty(true);
            }
        } else {
            if (date.length === 0) {
                updateDisruption({ endDate: '', endTime: '', isEndDateDirty: false });
            } else {
                const newEndDate = moment(date[0]).format(DATE_FORMAT);
                updateDisruption({
                    endDate: newEndDate,
                    endTime: '23:59',
                    isEndDateDirty: false,
                });
            }
            setIsEndDateDirty(false);
        }
    };

    const onBlurEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0 && safeDisruption.status !== STATUSES.DRAFT) {
                setIsEndDateDirty(true);
            } else {
                setIsEndDateDirty(false);
            }
        } else {
            setIsEndDateDirty(false);
        }
    };

    const onUpdateRecurrencePattern = (byweekday) => {
        setDisruption(prev => ({
            ...prev,
            recurrencePattern: { ...prev.recurrencePattern, byweekday },
        }));
    };

    const isViewAllDisabled = () => !isDateTimeValid() || isEmpty(safeDisruption.recurrencePattern?.byweekday);

    const displayActivePeriods = () => {
        setActivePeriods(generateActivePeriodsFromRecurrencePattern(
            safeDisruption.recurrencePattern,
            safeDisruption.duration,
        ));
        setActivePeriodsModalOpen(true);
    };

    const onAffectedEntitiesUpdate = (disruptionKey, valueKey, affectedEntities) => {
        const updatedDisruptions = {
            ...safeDisruption,
            affectedEntities: {
                ...safeDisruption.affectedEntities,
                [valueKey]: affectedEntities,
            },
        };
        setDisruption(updatedDisruptions);
        setRequireMapUpdate(true);
        props.setDisruptionForWorkaroundEdit(updatedDisruptions);
        props.setRequireToUpdateWorkaroundsState(true);
    };

    const resetAffectedEntities = () => {
        setDisruption(prev => ({
            ...prev,
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [],
            },
        }));
        setRequireMapUpdate(true);
        props.updateAffectedStopsState([]);
        props.updateAffectedRoutesState([]);
    };

    const onDisruptionTypeUpdate = (key, disruptionType) => {
        updateDisruption({ disruptionType });
    };

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const setDisruptionStatus = (selectedStatus) => {
        if (safeDisruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.RESOLVED) {
            updateDisruption({
                startDate: moment().format(DATE_FORMAT),
                startTime: moment().format(TIME_FORMAT),
                endDate: moment().format(DATE_FORMAT),
                endTime: moment().format(TIME_FORMAT),
            });
            props.setDisruptionForWorkaroundEdit({
                ...safeDisruption,
                status: selectedStatus,
            });
            props.setRequireToUpdateWorkaroundsState(true);
        } else if (safeDisruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.IN_PROGRESS) {
            updateDisruption({
                startDate: moment().format(DATE_FORMAT),
                startTime: moment().format(TIME_FORMAT),
            });
        } else if (safeDisruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.NOT_STARTED) {
            updateDisruption({
                startDate: moment(safeDisruption.startTime).format(DATE_FORMAT),
                startTime: moment(safeDisruption.startTime).format(TIME_FORMAT),
                endDate: '',
                endTime: '',
            });
        } else if (safeDisruption.status === STATUSES.IN_PROGRESS && selectedStatus === STATUSES.RESOLVED) {
            updateDisruption({
                endDate: moment().format(DATE_FORMAT),
                endTime: moment().format(TIME_FORMAT),
            });
            props.setDisruptionForWorkaroundEdit({
                ...safeDisruption,
                status: selectedStatus,
            });
            props.setRequireToUpdateWorkaroundsState(true);
        } else if (safeDisruption.status === STATUSES.RESOLVED && selectedStatus !== STATUSES.RESOLVED) {
            props.setDisruptionForWorkaroundEdit({
                ...safeDisruption,
                status: selectedStatus,
            });
            props.setRequireToUpdateWorkaroundsState(true);
        }
        updateDisruption({ status: selectedStatus });
    };

    const setDisruptionEntity = () => {
        const startDate = safeDisruption.startDate ? safeDisruption.startDate : moment(safeDisruption.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, safeDisruption.startTime);

        let endTimeMoment;
        if (!isEmpty(safeDisruption.endDate) && !isEmpty(safeDisruption.endTime)) {
            endTimeMoment = momentFromDateTime(safeDisruption.endDate, safeDisruption.endTime);
        }
        return {
            ...safeDisruption,
            notes: [...(safeDisruption.notes || []), ...(safeDisruption.note ? [{ description: safeDisruption.note }] : [])],
            affectedEntities: [...(safeDisruption.affectedEntities?.affectedRoutes || []), ...(safeDisruption.affectedEntities?.affectedStops || [])],
            endTime: endTimeMoment,
            startTime: startTimeMoment,
        };
    };

    const saveAndShareHandler = async () => {
        const disruptionEntity = setDisruptionEntity();
        const result = await props.updateDisruptionAction(disruptionEntity);
        shareToEmail(result || disruptionEntity);
        // Reset diversion manager state
        props.openDiversionManager(false);
        props.updateDiversionMode(EDIT_TYPE.CREATE);
        props.updateDiversionToEdit(null);
        props.toggleEditEffectPanel(false);
        props.updateDisruptionKeyToEditEffect('');
        updateDisruption({ note: '' });
        props.setDisruptionForWorkaroundEdit({});
    };

    const shareToEmailHandler = async () => {
        const disruptionEntity = setDisruptionEntity();
        shareToEmail(disruptionEntity);
    };

    const activePeriodsValidV2 = () => {
        if (safeDisruption.recurrent) {
            return isActivePeriodsValid(safeDisruption.recurrencePattern, safeDisruption.duration, safeDisruption.maxActivePeriodsCount);
        }
        return true;
    };

    const onBlurTitle = () => {
        setIsTitleDirty(true);
    };

    const openWorkaroundPanel = () => {
        props.setDisruptionForWorkaroundEdit(disruption);
        props.updateDisruptionKeyToWorkaroundEdit(props.disruptionIncidentNoToEdit);
        props.toggleWorkaroundPanel(true);
    };

    const isRequiredPropsEmpty = () => {
        const isPropsEmpty = some([
            safeDisruption.startTime,
            safeDisruption.startDate,
            safeDisruption.impact,
            safeDisruption.cause,
            safeDisruption.header,
            safeDisruption.severity,
        ], isEmpty);
        const isEndTimeRequiredAndEmpty = !safeDisruption.recurrent
            && !isEmpty(safeDisruption.endDate)
            && isEmpty(safeDisruption.endTime);
        const isWeekdayRequiredAndEmpty = safeDisruption.recurrent
            && isEmpty(safeDisruption.recurrencePattern?.byweekday);
        return isPropsEmpty || isEndTimeRequiredAndEmpty || isWeekdayRequiredAndEmpty;
    };

    const affectedEntitySelected = () => {
        if (!safeDisruption.affectedEntities) return false;
        return (safeDisruption.affectedEntities.affectedRoutes || []).length > 0 || (safeDisruption.affectedEntities.affectedStops || []).length > 0;
    };
    const isRequiredDraftPropsEmpty = () => some([safeDisruption.header, safeDisruption.cause], isEmpty);

    const isSubmitDisabled = isRequiredPropsEmpty()
        || !startTimeValid()
        || !startDateValid()
        || !endTimeValid()
        || !endDateValid()
        || !durationValid()
        || !affectedEntitySelected();
    const isDraftSubmitDisabled = isRequiredDraftPropsEmpty();

    const impacts = useAlertEffects();

    const onAddNote = (note) => {
        const startDate = originalDisruption.startDate ? originalDisruption.startDate : moment(originalDisruption.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, originalDisruption.startTime);

        let endTimeMoment;
        if (!isEmpty(originalDisruption.endDate) && !isEmpty(originalDisruption.endTime)) {
            endTimeMoment = momentFromDateTime(originalDisruption.endDate, originalDisruption.endTime);
        }
        const updatedDisruption = {
            ...originalDisruption,
            notes: [
                ...(originalDisruption.notes || []),
                { description: safeDisruption.note },
            ],
            affectedEntities: [
                ...(originalDisruption.affectedEntities?.affectedRoutes || []),
                ...(originalDisruption.affectedEntities?.affectedStops || []),
            ],
            endTime: endTimeMoment,
            startTime: startTimeMoment,
        };
        props.updateDisruptionAction(updatedDisruption);
        updateDisruption({ note: '' });
    };

    const onSubmit = () => {
        props.updateDisruptionAction(setDisruptionEntity());

        // Reset diversion manager state
        props.openDiversionManager(false);
        props.updateDiversionMode(EDIT_TYPE.CREATE);
        props.updateDiversionToEdit(null);
        props.toggleEditEffectPanel(false);
        props.updateDisruptionKeyToEditEffect('');
        updateDisruption({ note: '' });
        props.setDisruptionForWorkaroundEdit({});
    };

    const handleAddNoteModalClose = (note) => {
        updateDisruption({ note });
        setNoteModalOpen(false);
    };

    const handleAddNoteModalSubmit = (note) => {
        onAddNote(note);
        setNoteModalOpen(false);
    };

    const removeNotFoundFromStopGroupsForAllDisruptions = () => {
        if (!disruptions || !Array.isArray(disruptions)) {
            return;
        }
        disruptions.forEach((d) => {
            if (d && d.affectedEntities && d.affectedEntities.affectedStops) {
                const filterStops = d.affectedEntities.affectedStops.filter(stop => stop.stopCode !== 'Not Found');
                if (filterStops.length !== d.affectedEntities.affectedStops.length) {
                    onAffectedEntitiesUpdate(d.key, 'affectedStops', filterStops);
                }
            }
        });
    };

    useEffect(() => {
        if (!props.isEditEffectPanelOpen) {
            // Only reset diversion manager state if DiversionManager is not open
            if (!props.isDiversionManagerOpen) {
                props.openDiversionManager(false);
                props.updateDiversionMode(EDIT_TYPE.CREATE);
                props.updateDiversionToEdit(null);
            }

            removeNotFoundFromStopGroupsForAllDisruptions();
            if (disruptions && Array.isArray(disruptions)) {
                const routes = disruptions.map(d => d.affectedEntities?.affectedRoutes || []).flat();
                const stops = disruptions.map(d => d.affectedEntities?.affectedStops || []).flat();

                props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));
                props.updateAffectedRoutesState(routes);

                if (routes.length > 0) {
                    props.getRoutesByShortName(routes);
                }
            }
        } else {
            setRequireMapUpdate(true);
        }
    }, [props.isEditEffectPanelOpen, props.disruptionIncidentNoToEdit, props.isDiversionManagerOpen]);

    const removeNotFoundFromStopGroups = () => {
        if (!safeDisruption.affectedEntities || !safeDisruption.affectedEntities.affectedStops) {
            return;
        }
        const filterStops = safeDisruption.affectedEntities.affectedStops.filter(stop => stop.stopCode !== 'Not Found');
        if (filterStops.length !== safeDisruption.affectedEntities.affectedStops.length) {
            onAffectedEntitiesUpdate(safeDisruption.key, 'affectedStops', filterStops);
        }
    };

    useEffect(() => {
        if (requireMapUpdate) {
            removeNotFoundFromStopGroups();
            if (safeDisruption.affectedEntities) {
                const routes = (safeDisruption.affectedEntities.affectedRoutes || []).flat();
                const stops = (safeDisruption.affectedEntities.affectedStops || []).flat();

                props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));
                props.updateAffectedRoutesState(routes);

                if (routes.length > 0) {
                    props.getRoutesByShortName(routes);
                }
            }
            setRequireMapUpdate(false);
        }
    }, [requireMapUpdate]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit && disruptions && Array.isArray(disruptions)) {
            const disruptionToSet = disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit);

            if (disruptionToSet) {
                setDisruption(disruptionToSet);
                setOriginalDisruption(disruptionToSet);
                props.setDisruptionForWorkaroundEdit(disruptionToSet);
                props.updateIsNotesRequiresToUpdateState();
            } else {
                const firstDisruption = disruptions[0];
                if (firstDisruption) {
                    const modifiedDisruption = {
                        ...firstDisruption,
                        incidentNo: disruptionIncidentNoToEdit,
                        key: disruptionIncidentNoToEdit,
                    };
                    setDisruption(modifiedDisruption);
                    setOriginalDisruption(modifiedDisruption);
                    props.setDisruptionForWorkaroundEdit(modifiedDisruption);
                    props.updateIsNotesRequiresToUpdateState();
                } else {
                    const defaultDisruption = {
                        ...INIT_EFFECT_STATE,
                        incidentNo: disruptionIncidentNoToEdit,
                        key: disruptionIncidentNoToEdit,
                    };
                    setDisruption(defaultDisruption);
                    setOriginalDisruption(defaultDisruption);
                    props.setDisruptionForWorkaroundEdit(defaultDisruption);
                }
            }
        }
    }, [disruptionIncidentNoToEdit, disruptions]);

    // Consolidated diversions loading effect
    useEffect(() => {
        const currentDiversionsId = safeDisruption?.disruptionId || safeDisruption?.incidentId;
        if (currentDiversionsId && !isLoadingDiversions) {
            props.fetchDiversions(currentDiversionsId);
        }
    }, [safeDisruption?.disruptionId, safeDisruption?.incidentId, isLoadingDiversions, props.fetchDiversions]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit && props.isNotesRequiresToUpdate && disruptions && Array.isArray(disruptions)) {
            const foundDisruption = disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit);
            if (foundDisruption) {
                updateDisruption({ notes: foundDisruption.notes });
                setOriginalDisruption(foundDisruption);
            }
            props.updateIsNotesRequiresToUpdateState();
        }
    }, [props.isNotesRequiresToUpdate]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit && props.isWorkaroundsRequiresToUpdate && props.workaroundsToSync && props.workaroundsToSync.length > 0) {
            updateDisruption({ workarounds: props.workaroundsToSync });
            props.updateIsWorkaroundsRequiresToUpdateState();
        }
    }, [props.isWorkaroundsRequiresToUpdate]);

    const isValuesChanged = !isEqual(safeDisruption, originalDisruption);
    const isResolved = () => safeDisruption.status === STATUSES.RESOLVED;

    const discardEffectChanges = () => {
        setDisruption(originalDisruption);
        props.openDiversionManager(false);
        props.updateDiversionMode(EDIT_TYPE.CREATE);
        props.updateDiversionToEdit(null);
        props.toggleIncidentModals('cancellationEffect', false);
    };

    const editDiversion = (diversion) => {
        props.updateDiversionMode(EDIT_TYPE.EDIT);
        props.updateDiversionToEdit(diversion);
        props.openDiversionManager(true);
        props.toggleEditEffectPanel(false);
    };

    const handleViewDiversions = () => {
        setIsViewDiversionsModalOpen(true);
    };

    return (
        <>
            {props.isEditEffectPanelOpen && props.disruptionIncidentNoToEdit && (
                <div className="edit-effect-panel"
                    style={ {
                        position: 'relative',
                        zIndex: 1000,
                    } }>
                    <Paper component={ Stack } direction="column" justifyContent="center" className="mui-paper">
                        <div className="edit-effect-panel-body">
                            <div className="label-with-icon">
                                <h2 className="pl-4 pr-4 pt-4">
                                    Edit details of Effect
                                    {' '}
                                </h2>
                                <div className="buttons-container">
                                    <div className="diversions-button-container">
                                        <HeaderButtons
                                            disruption={ safeDisruption }
                                            useDiversionFlag={ props.useDiversion }
                                            isDiversionManagerOpen={ props.isDiversionManagerOpen }
                                            isWorkaroundPanelOpen={ props.isWorkaroundPanelOpen }
                                            onViewDiversions={ handleViewDiversions }
                                            onOpenWorkaroundPanel={ openWorkaroundPanel }
                                            openDiversionManagerAction={ props.openDiversionManager }
                                            updateDiversionModeAction={ props.updateDiversionMode }
                                            updateDiversionToEditAction={ props.updateDiversionToEdit }
                                            toggleEditEffectPanel={ props.toggleEditEffectPanel }
                                            fetchDiversionsAction={ props.fetchDiversions }
                                            clearDiversionsCacheAction={ props.clearDiversionsCache }
                                        />
                                    </div>
                                    <div className="workaround-button-container">
                                        {!props.isWorkaroundPanelOpen && (
                                            <KeyboardDoubleArrowRightIcon
                                                onClick={ openWorkaroundPanel }
                                                className="collapse-icon"
                                                style={ { color: '#399CDB', fontSize: '48px' } }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Form key="form" className="row my-3 p-4 incident-effect">
                                <div className="col-12">
                                    <FormGroup>
                                        <Label for="disruption-creation__wizard-select-details__header">
                                            <span className="font-size-md font-weight-bold">{LABEL_HEADER}</span>
                                        </Label>
                                        <Input
                                            id="disruption-creation__wizard-select-details__header"
                                            className="w-100 border border-dark"
                                            placeholder="Title of the message"
                                            maxLength={ HEADER_MAX_LENGTH }
                                            onChange={ event => updateDisruption({ header: event.target.value }) }
                                            onBlur={ onBlurTitle }
                                            value={ safeDisruption.header || '' }
                                            invalid={ isTitleDirty && !titleValid() }
                                            disabled={ isResolved() }
                                        />
                                        <FormFeedback>Please enter disruption title</FormFeedback>
                                    </FormGroup>
                                </div>
                                <div className="col-6">
                                    <FormGroup>
                                        <DisruptionDetailSelect
                                            id="disruption-creation__wizard-select-details__impact"
                                            className=""
                                            value={ safeDisruption.impact || '' }
                                            options={ impacts }
                                            label={ LABEL_CUSTOMER_IMPACT }
                                            invalid={ isImpactDirty && !impactValid() }
                                            feedback="Please select effect"
                                            disabled={ isResolved() }
                                            disabledClassName="background-color-for-disabled-fields"
                                            onBlur={ (selectedItem) => {
                                                updateDisruption({ impact: selectedItem });
                                                setIsImpactDirty(true);
                                            } }
                                            onChange={ (selectedItem) => {
                                                updateDisruption({ impact: selectedItem });
                                                setIsImpactDirty(true);
                                            } } />
                                    </FormGroup>
                                </div>
                                <div className="col-6">
                                    <FormGroup>
                                        <DisruptionDetailSelect
                                            id="disruption-detail__status"
                                            className=""
                                            value={ safeDisruption.status || '' }
                                            options={ getStatusOptions(safeDisruption.startDate, safeDisruption.startTime, now, safeDisruption.status) }
                                            label={ LABEL_STATUS }
                                            onChange={ setDisruptionStatus } />
                                    </FormGroup>
                                </div>
                                <div className="col-6">
                                    <FormGroup className="position-relative">
                                        <Label for="disruption-creation__wizard-select-details__start-date">
                                            <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                                        </Label>
                                        <div className={ `${isResolved() ? 'background-color-for-disabled-fields' : ''}` }>
                                            <Flatpickr
                                                key="start-date"
                                                id="disruption-creation__wizard-select-details__start-date"
                                                className={ `font-weight-normal cc-form-control form-control ${isStartDateDirty ? 'is-invalid' : ''}` }
                                                value={ safeDisruption.startDate || '' }
                                                options={ datePickerOptions }
                                                placeholder="Select date"
                                                onChange={ date => onChangeStartDate(date) }
                                                disabled={ isResolved() } />
                                        </div>
                                        {!isStartDateDirty && (
                                            <FaRegCalendarAlt
                                                className="disruption-creation__wizard-select-details__icon position-absolute"
                                                size={ 22 } />
                                        )}
                                        {isStartDateDirty && (
                                            <div className="disruption-recurrence-invalid">Please select start date</div>
                                        )}
                                    </FormGroup>
                                    <FormGroup className="position-relative">
                                        <Label for="disruption-creation__wizard-select-details__end-date">
                                            <span className="font-size-md font-weight-bold">
                                                {!disruptionRecurrent ? getOptionalLabel(LABEL_END_DATE) : LABEL_END_DATE}
                                            </span>
                                        </Label>
                                        <div className={ `${isResolved() ? 'background-color-for-disabled-fields' : ''}` }>
                                            <Flatpickr
                                                key="end-date"
                                                id="disruption-creation__wizard-select-details__end-date"
                                                className={ `font-weight-normal cc-form-control form-control ${isEndDateDirty ? 'is-invalid' : ''}` }
                                                value={ safeDisruption.endDate || '' }
                                                options={ endDateDatePickerOptions() }
                                                onChange={ date => onChangeEndDate(date, disruptionRecurrent) }
                                                onOpen={ date => onBlurEndDate(date, false) }
                                                disabled={ isResolved() }
                                            />
                                        </div>
                                        {!isEndDateDirty && (
                                            <FaRegCalendarAlt
                                                className="disruption-creation__wizard-select-details__icon position-absolute"
                                                size={ 22 } />
                                        )}
                                        {isEndDateDirty && (
                                            <span className="disruption-recurrence-invalid">Please select end date</span>
                                        )}
                                    </FormGroup>
                                </div>
                                <div className="col-6">
                                    <FormGroup>
                                        <Label for="disruption-creation__wizard-select-details__start-time">
                                            <span className="font-size-md font-weight-bold">{LABEL_START_TIME}</span>
                                        </Label>
                                        <Input
                                            id="disruption-creation__wizard-select-details__start-time"
                                            className="border border-dark"
                                            value={ safeDisruption.startTime || '' }
                                            onChange={ (event) => {
                                                updateDisruption({ startTime: event.target.value });
                                                setIsStartTimeDirty(true);
                                            } }
                                            invalid={ (safeDisruption.status === STATUSES.DRAFT ? (isStartTimeDirty && !startTimeValid()) : !startTimeValid()) }
                                            disabled={ isResolved() }
                                        />
                                        <FormFeedback>Not valid values</FormFeedback>
                                    </FormGroup>
                                    {!disruptionRecurrent && (
                                        <FormGroup>
                                            <Label for="disruption-creation__wizard-select-details__end-time">
                                                <span className="font-size-md font-weight-bold">{getOptionalLabel(LABEL_END_TIME)}</span>
                                            </Label>
                                            <Input
                                                id="disruption-creation__wizard-select-details__end-time"
                                                className="border border-dark"
                                                value={ safeDisruption.endTime || '' }
                                                onChange={ event => updateDisruption({ endTime: event.target.value }) }
                                                invalid={ !endTimeValid() }
                                                disabled={ isResolved() }
                                            />
                                            <FormFeedback>Not valid values</FormFeedback>
                                        </FormGroup>
                                    )}
                                    { disruptionRecurrent && (
                                        <FormGroup>
                                            <Label for="disruption-creation__wizard-select-details__duration">
                                                <span className="font-size-md font-weight-bold">{LABEL_DURATION_HOURS}</span>
                                            </Label>
                                            <Input
                                                id="disruption-creation__wizard-select-details__duration"
                                                className="border border-dark"
                                                value={ disruption.duration }
                                                onChange={ event => updateDisruption({ duration: event.target.value }) }
                                                invalid={ isDurationDirty && !durationValid() }
                                                onBlur={ () => setIsDurationDirty(true) }
                                                type="number"
                                                min="1"
                                                max="24"
                                                disabled={ isResolved() }
                                            />
                                            <FormFeedback>Not valid duration</FormFeedback>
                                        </FormGroup>
                                    )}
                                </div>
                                <div className="col-6">
                                    <FormGroup>
                                        <DisruptionDetailSelect
                                            id="disruption-creation__wizard-select-details__severity"
                                            className=""
                                            value={ disruption.severity }
                                            options={ SEVERITIES }
                                            label={ LABEL_SEVERITY }
                                            invalid={ isSeverityDirty && !severityValid() }
                                            feedback="Please select severity"
                                            disabled={ isResolved() }
                                            disabledClassName="background-color-for-disabled-fields"
                                            onBlur={ (selectedItem) => {
                                                updateDisruption({ severity: selectedItem, isSeverityDirty: true });
                                                setIsSeverityDirty(true);
                                            } }
                                            onChange={ (selectedItem) => {
                                                updateDisruption({ severity: selectedItem, isSeverityDirty: true });
                                                setIsSeverityDirty(true);
                                            } }
                                        />
                                    </FormGroup>
                                </div>

                                <div className="col-12">
                                    <FormGroup>
                                        <div className="label-with-icon">
                                            <Label for="disruption-detail__notes">
                                                <span className="font-size-md font-weight-bold">
                                                    {LABEL_DISRUPTION_NOTES}
                                                    {' '}
                                                </span>
                                            </Label>
                                            <HistoryIcon style={ { color: '#399CDB', cursor: 'pointer' } } onClick={ () => setHistoryNotesModalOpen(true) } />
                                        </div>
                                        <Input id="disruption-detail__notes"
                                            className="textarea-no-resize border border-dark"
                                            type="textarea"
                                            value={ disruption.note }
                                            onChange={ e => updateDisruption({ note: e.currentTarget.value }) }
                                            maxLength={ DESCRIPTION_NOTE_MAX_LENGTH }
                                            rows={ 5 } />
                                        {props.useDisruptionNotePopup && (
                                            <OpenInNewOutlinedIcon
                                                className="disruption-detail-expand-note-icon"
                                                onClick={ () => setNoteModalOpen(true) }
                                            />
                                        )}
                                        <div className="flex-justify-content-end">
                                            <Button
                                                className="add-note-button cc-btn-secondary"
                                                onClick={ () => onAddNote(disruption.note) }>
                                                Add note
                                            </Button>
                                        </div>
                                    </FormGroup>
                                </div>
                                { disruption.notes.length > 0 && (
                                    <div className="col-12 last-note-grid">
                                        <span className="font-size-md font-weight-bold last-note-label">Last note</span>
                                        <span className="pl-2 last-note-info">
                                            {disruption.notes[disruption.notes.length - 1].createdBy}
                                            {', '}
                                            {formatCreatedUpdatedTime(disruption.notes[disruption.notes.length - 1].createdTime)}
                                        </span>
                                        <span className="pl-2 last-note-description pt-2">
                                            {disruption.notes[disruption.notes.length - 1].description}
                                        </span>
                                    </div>
                                )}

                                <div className="col-6">
                                    <FormGroup>
                                        <DisruptionDetailSelect
                                            id="disruption-creation__wizard-select-details__severity"
                                            className=""
                                            value={ disruption.severity }
                                            options={ SEVERITIES }
                                            label={ LABEL_SEVERITY }
                                            invalid={ isSeverityDirty && !severityValid() }
                                            feedback="Please select severity"
                                            disabled={ isResolved() }
                                            disabledClassName="background-color-for-disabled-fields"
                                            onBlur={ (selectedItem) => {
                                                updateDisruption({ severity: selectedItem, isSeverityDirty: true });
                                                setIsSeverityDirty(true);
                                            } }
                                            onChange={ (selectedItem) => {
                                                updateDisruption({ severity: selectedItem, isSeverityDirty: true });
                                                setIsSeverityDirty(true);
                                            } }
                                        />
                                    </FormGroup>
                                </div>

                                <div className="col-12">
                                    <FormGroup>
                                        <div className="label-with-icon">
                                            <Label for="disruption-detail__notes">
                                                <span className="font-size-md font-weight-bold">
                                                    {LABEL_DISRUPTION_NOTES}
                                                    {' '}
                                                </span>
                                            </Label>
                                            <HistoryIcon style={ { color: '#399CDB', cursor: 'pointer' } } onClick={ () => setHistoryNotesModalOpen(true) } />
                                        </div>
                                        <Input id="disruption-detail__notes"
                                            className="textarea-no-resize border border-dark"
                                            type="textarea"
                                            value={ disruption.note }
                                            onChange={ e => updateDisruption({ note: e.currentTarget.value }) }
                                            maxLength={ DESCRIPTION_NOTE_MAX_LENGTH }
                                            rows={ 5 } />
                                        <div className="flex-justify-content-end">
                                            <Button
                                                className="add-note-button cc-btn-secondary"
                                                onClick={ () => onAddNote() }>
                                                Add note
                                            </Button>
                                        </div>
                                    </FormGroup>
                                </div>
                                { disruption.notes.length > 0 && (
                                    <div className="col-12 last-note-grid">
                                        <span className="font-size-md font-weight-bold last-note-label">Last note</span>
                                        <span className="pl-2 last-note-info">
                                            {disruption.notes[disruption.notes.length - 1].createdBy}
                                            {', '}
                                            {formatCreatedUpdatedTime(disruption.notes[disruption.notes.length - 1].createdTime)}
                                        </span>
                                        <span className="pl-2 last-note-description pt-2">
                                            {disruption.notes[disruption.notes.length - 1].description}
                                        </span>
                                    </div>
                                )}
                                <div className="col-12">
                                    <FormGroup className="disruption-creation__checkbox">
                                        <Input
                                            type="checkbox"
                                            className="ml-0"
                                            onChange={ event => updateDisruption({ createNotification: event.currentTarget.checked }) }
                                            checked={ disruption.createNotification }
                                            disabled={ isResolved() }
                                        />
                                        <span className="pl-2">Draft Stop Message</span>
                                    </FormGroup>
                                </div>
                                <div className="disruption-display-block">
                                    <SelectEffectEntities
                                        disruptionKey={ safeDisruption.key || '' }
                                        affectedEntities={ safeDisruption.affectedEntities || { affectedRoutes: [], affectedStops: [] } }
                                        onAffectedEntitiesUpdate={ onAffectedEntitiesUpdate }
                                        resetAffectedEntities={ resetAffectedEntities }
                                        disruptionType={ safeDisruption.disruptionType || DISRUPTION_TYPE.ROUTES }
                                        onDisruptionTypeUpdate={ onDisruptionTypeUpdate }
                                        isEditDisabled={ isResolved() } />
                                </div>
                            </Form>
                        </div>
                        <footer className="row m-0 justify-content-end p-4 position-fixed incident-footer-min-height">
                            <div className="col-4">
                                <Button
                                    className="btn cc-btn-primary btn-block save-workaround"
                                    onClick={ () => setDisruptionsDetailsModalOpen(true) }>
                                    Preview & Share
                                </Button>
                            </div>
                            <div className="col-4">
                                {isValuesChanged && (
                                    <Button
                                        disabled={ (disruption.status === STATUSES.DRAFT ? isDraftSubmitDisabled : isSubmitDisabled) || props.isWorkaroundPanelOpen }
                                        className="btn cc-btn-primary btn-block save-workaround"
                                        onClick={ () => saveAndShareHandler() }>
                                        Save & Share
                                    </Button>
                                )}
                                {!isValuesChanged && (
                                    <Button
                                        disabled={ (disruption.status === STATUSES.DRAFT ? isDraftSubmitDisabled : isSubmitDisabled) || props.isWorkaroundPanelOpen }
                                        className="btn cc-btn-primary btn-block save-workaround"
                                        onClick={ () => shareToEmailHandler() }>
                                        Share to email
                                    </Button>
                                )}
                            </div>
                            <div className="col-4">
                                <Button
                                    disabled={ (disruption.status === STATUSES.DRAFT ? isDraftSubmitDisabled : isSubmitDisabled) || props.isWorkaroundPanelOpen }
                                    className="btn cc-btn-primary btn-block save-workaround"
                                    onClick={ () => onSubmit() }>
                                    Save
                                </Button>
                            </div>
                        </footer>
                    </Paper>
                </div>
            )}
            <HistoryNotesModal
                disruption={ disruption }
                isModalOpen={ historyNotesModalOpen }
                onClose={ () => setHistoryNotesModalOpen(false) } />
            <AddNoteModal
                disruption={ disruption }
                isModalOpen={ noteModalOpen }
                onClose={ note => handleAddNoteModalClose(note) }
                onSubmit={ note => handleAddNoteModalSubmit(note) }
            />
            <CustomMuiDialog
                title="Disruption Active Periods"
                onClose={ () => setActivePeriodsModalOpen(false) }
                isOpen={ activePeriodsModalOpen }>
                <ActivePeriods activePeriods={ activePeriods } />
            </CustomMuiDialog>
            <DisruptionSummaryModal
                disruption={ disruption }
                isModalOpen={ disruptionsDetailsModalOpen }
                onClose={ () => setDisruptionsDetailsModalOpen(false) } />
            <CustomModal
                className="disruption-creation__modal"
                title="Edit effect"
                isModalOpen={ props.isCancellationEffectOpen }>
                <CancellationEffect discardChanges={ () => discardEffectChanges() } />
            </CustomModal>
            <ViewDiversionDetailModal
                disruption={ safeDisruption }
                onClose={ () => {
                    setIsViewDiversionsModalOpen(false);
                } }
                onEditDiversion={ editDiversion }
                isOpen={ isViewDiversionsModalOpen }
                setShouldRefetchDiversions={ setShouldRefetchDiversions }
                diversions={ diversions }
                isLoadingDiversions={ isLoadingDiversions }
                deleteDiversion={ props.deleteDiversion }
            />
        </>
    );
};

EditEffectPanel.propTypes = {
    disruptions: PropTypes.array.isRequired,
    toggleEditEffectPanel: PropTypes.func.isRequired,
    isEditEffectPanelOpen: PropTypes.bool,
    disruptionIncidentNoToEdit: PropTypes.string,
    updateDisruptionKeyToEditEffect: PropTypes.func.isRequired,
    disruptionRecurrent: PropTypes.bool.isRequired,
    modalOpenedTime: PropTypes.string.isRequired,
    isWorkaroundPanelOpen: PropTypes.bool,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
    isNotesRequiresToUpdate: PropTypes.bool.isRequired,
    updateIsNotesRequiresToUpdateState: PropTypes.func.isRequired,
    isWorkaroundsRequiresToUpdate: PropTypes.bool.isRequired,
    updateIsWorkaroundsRequiresToUpdateState: PropTypes.func.isRequired,
    updateDisruptionAction: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    setRequireToUpdateWorkaroundsState: PropTypes.func.isRequired,
    setDisruptionForWorkaroundEdit: PropTypes.func.isRequired,
    workaroundsToSync: PropTypes.array,
    isCancellationEffectOpen: PropTypes.bool,
    toggleIncidentModals: PropTypes.func.isRequired,
    onDisruptionsUpdate: PropTypes.func, // Added for parent update
    isDiversionManagerOpen: PropTypes.bool,
    openDiversionManager: PropTypes.func,
    updateDiversionMode: PropTypes.func,
    updateDiversionToEdit: PropTypes.func,
    fetchDiversions: PropTypes.func,
    clearDiversionsCache: PropTypes.func,
    deleteDiversion: PropTypes.func,
    useDiversion: PropTypes.bool,
    state: PropTypes.object,
    setRequestedDisruptionKeyToUpdateEditEffect: PropTypes.func.isRequired,
    updateEditableDisruption: PropTypes.func.isRequired,
    applyDisruptionChanges: PropTypes.func.isRequired,
    updateEffectValidationState: PropTypes.func.isRequired,
    updateIsEffectUpdatedState: PropTypes.func.isRequired,
    useDisruptionNotePopup: PropTypes.bool,
};

EditEffectPanel.defaultProps = {
    isEditEffectPanelOpen: false,
    disruptionIncidentNoToEdit: '',
    isWorkaroundPanelOpen: false,
    workaroundsToSync: [],
    isCancellationEffectOpen: false,
    onDisruptionsUpdate: null,
    isDiversionManagerOpen: false,
    openDiversionManager: () => {},
    updateDiversionMode: () => {},
    updateDiversionToEdit: () => {},
    fetchDiversions: () => {},
    clearDiversionsCache: () => {},
    deleteDiversion: () => {},
    useDiversion: false,
    state: {},
    useDisruptionNotePopup: false,
};

export default connect(state => ({
    isEditEffectPanelOpen: isEditEffectPanelOpen(state),
    disruptionIncidentNoToEdit: getRequestedDisruptionKeyToUpdateEditEffect(state),
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
    isCancellationEffectOpen: isCancellationEffectModalOpen(state),
    state,
    useDisruptionNotePopup: useDisruptionNotePopup(state),
}), {
    toggleEditEffectPanel,
    updateDisruptionKeyToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    updateDisruptionAction,
    getRoutesByShortName,
    updateAffectedRoutesState,
    updateAffectedStopsState,
    setRequireToUpdateWorkaroundsState,
    setDisruptionForWorkaroundEdit,
    toggleIncidentModals,
    fetchDiversions,
    clearDiversionsCache,
    deleteDiversion,
})(EditEffectPanel);
