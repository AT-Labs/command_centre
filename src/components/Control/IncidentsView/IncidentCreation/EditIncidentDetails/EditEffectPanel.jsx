import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Paper, Stack, Button as MuiButton } from '@mui/material';
import { isEmpty, sortBy, some, isEqual, omit } from 'lodash-es';
import { Form, FormFeedback, FormGroup, Input, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { GiDetour } from 'react-icons/gi';
import Flatpickr from 'react-flatpickr';
import { RRule } from 'rrule';
import moment from 'moment';
import { BsArrowRepeat } from 'react-icons/bs';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import HistoryIcon from '@mui/icons-material/History';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { MAX_NUMBER_OF_ENTITIES,
    LABEL_CUSTOMER_IMPACT,
    LABEL_START_DATE,
    DATE_FORMAT,
    TIME_FORMAT,
    LABEL_END_DATE,
    LABEL_END_TIME,
    LABEL_START_TIME,
    LABEL_SEVERITY,
    LABEL_DURATION_HOURS,
    LABEL_EFFECT_HEADER,
    HEADER_MAX_LENGTH,
    LABEL_STATUS,
    LABEL_DISRUPTION_NOTES,
    DESCRIPTION_NOTE_MAX_LENGTH } from '../../../../../constants/disruptions.js';
import { getEntityCounts,
    generateSelectedText,
    mergeExistingAndDrawnEntities,
    startDateTimeWillBeAutomaticallyUpdated,
    endDateTimeWillBeAutomaticallyUpdated,
    isTimeFieldValid,
    isDateFieldValid,
} from '../../../../../utils/control/incidents';
import IncidentLimitModal from '../../Modals/IncidentLimitModal.jsx';
import { isEditEffectPanelOpen,
    getDisruptionKeyToEditEffect,
    isWorkaroundPanelOpen,
    isEditEffectUpdateRequested,
    getRequestedDisruptionKeyToUpdateEditEffect,
    isCancellationEffectModalOpen,
    getMapDrawingEntities,
} from '../../../../../redux/selectors/control/incidents';
import { isLoading as isDataLoading } from '../../../../../redux/selectors/activity';
import { DisruptionDetailSelect } from '../../../DisruptionsView/DisruptionDetail/DisruptionDetailSelect';
import {
    isEndDateValid,
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
    isDurationValid,
    isStartDateTimeEarlierThanNow,
    getRecurrenceDates,
    getStatusOptions,
    formatCreatedUpdatedTime,
    momentFromDateTime,
} from '../../../../../utils/control/disruptions';
import {
    generateActivePeriodsFromRecurrencePattern,
    getRecurrenceText,
    parseRecurrencePattern,
    isActivePeriodsValid } from '../../../../../utils/recurrence';
import { DISRUPTION_TYPE, getParentChildDefaultSeverity, STATUSES, getParentChildSeverityOptions } from '../../../../../types/disruptions-types';
import SelectEffectEntities from '../WizardSteps/SelectEffectEntities';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
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
    setRequestToUpdateEditEffectState,
    toggleIncidentModals,
    setRequestedDisruptionKeyToUpdateEditEffect,
    clearMapDrawingEntities,
} from '../../../../../redux/actions/control/incidents';
import { updateDataLoading } from '../../../../../redux/actions/activity';
import { useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { getDatePickerOptions } from '../../../../../utils/dateUtils';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import HistoryNotesModal from './HistoryNotesModal';
import { shareToEmail } from '../../../../../utils/control/disruption-sharing';
import CustomMuiDialog from '../../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../../Common/ActivePeriods/ActivePeriods';
import DisruptionSummaryModal from './DisruptionSummaryModal';
import CancellationEffectModal from './CancellationEffectModal';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import './EditEffectPanel.scss';
import AddNoteModal from './AddNoteModal';
import { useDisruptionNotePopup, useDiversion } from '../../../../../redux/selectors/appSettings';
import { getIsDiversionManagerOpen, getIsDiversionManagerLoading, getIsDiversionManagerReady } from '../../../../../redux/selectors/control/diversions';
import { ViewDiversionDetailModal } from '../../../DisruptionsView/DisruptionDetail/ViewDiversionDetailModal';
import { openDiversionManager, updateDiversionMode, updateDiversionToEdit } from '../../../../../redux/actions/control/diversions';
import EDIT_TYPE from '../../../../../types/edit-types';
import DiversionManager from '../../../DisruptionsView/DiversionManager';
import { getDisruption as getDisruptionAPI, getDiversion as getDiversionAPI } from '../../../../../utils/transmitters/disruption-mgt-api';

const INIT_EFFECT_STATE = {
    key: '',
    disruptionId: '',
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    impact: DEFAULT_IMPACT.value,
    cause: DEFAULT_CAUSE.value,
    affectedEntities: {
        affectedRoutes: [],
        affectedStops: [],
    },
    createNotification: false,
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: getParentChildDefaultSeverity().value,
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

export function updateDisruptionWithFetchData(fetchedDisruption, disruption, updateDisruptionState) {
    if (fetchedDisruption == null) return;

    // Moving shapeWkt over to fetchedDisruption: Somehow, the caller of <EditEffectpanel> have appended shapeWkt. Reusing that.
    const shapeWktMap = new Map(
        disruption.affectedEntities.affectedRoutes.map(route => [route.routeId, route.shapeWkt]),
    );
    const newAffectedRoutes = fetchedDisruption.affectedEntities.map((entity) => {
        const shapeWkt = shapeWktMap.get(entity.routeId);
        return {
            ...entity,
            shapeWkt,
        };
    });

    // Set the new disruption with updated affectedEntities
    updateDisruptionState({
        ...disruption,
        affectedEntities: {
            ...disruption.affectedEntities,
            affectedRoutes: newAffectedRoutes,
        },
    });
}

export const EditEffectPanel = (props, ref) => {
    const { disruptions, disruptionIncidentNoToEdit, disruptionRecurrent, modalOpenedTime, incidentEndDate } = props;
    const [disruption, setDisruption] = useState({ ...INIT_EFFECT_STATE });
    const [originalDisruption, setOriginalDisruption] = useState({ ...INIT_EFFECT_STATE });
    const [now] = useState(moment().second(0).millisecond(0));
    const [activePeriods, setActivePeriods] = useState([]);
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);
    const [isStartTimeDirty, setIsStartTimeDirty] = useState(false);
    const [isTitleDirty, setIsTitleDirty] = useState(false);
    const [isStartDateDirty, setIsStartDateDirty] = useState(false);
    const [isStartDateInvalid, setIsStartDateInvalid] = useState(false);
    const [isEndDateInvalid, setIsEndDateInvalid] = useState(false);
    const [isImpactDirty, setIsImpactDirty] = useState(false);
    const [isSeverityDirty, setIsSeverityDirty] = useState(false);
    const [isDurationDirty, setIsDurationDirty] = useState(false);
    const [isRecurrencePatternDirty, setIsRecurrencePatternDirty] = useState(false);
    const [historyNotesModalOpen, setHistoryNotesModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [requireMapUpdate, setRequireMapUpdate] = useState(false);
    const [disruptionsDetailsModalOpen, setDisruptionsDetailsModalOpen] = useState(false);

    const [isDiversionMenuOpen, setIsDiversionMenuOpen] = useState(false);
    const [isViewDiversionsModalOpen, setIsViewDiversionsModalOpen] = useState(false);
    const [fetchedDisruption, setFetchedDisruption] = useState(null);
    const [isLoadingDisruption, setIsLoadingDisruption] = useState(false);
    const [localDiversions, setLocalDiversions] = useState([]);
    const [shouldRefetchDiversions, setShouldRefetchDiversions] = useState(false);
    const [isLoaderProtected, setIsLoaderProtected] = useState(false);
    const isMounted = useRef(true);
    const [totalEntities, setTotalEntities] = useState(0);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const maxActivePeriodsCount = 100;

    const initDisruptionData = () => {
        const foundDisruption = disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit);
        if (!foundDisruption) return;

        const disruptionToSet = { ...foundDisruption };

        if (disruptionRecurrent && isEmpty(disruptionToSet.endDate) && incidentEndDate) {
            disruptionToSet.endDate = incidentEndDate;
        }

        setDisruption(disruptionToSet);
        props.updateEditableDisruption(disruptionToSet);
        setOriginalDisruption(disruptionToSet);
        props.setDisruptionForWorkaroundEdit(disruptionToSet);
        props.updateIsNotesRequiresToUpdateState();
        setTimeout(() => setRequireMapUpdate(true), 0);
    };

    useEffect(() => {
        if (disruptionIncidentNoToEdit && disruptions && disruptions.length > 0) {
            initDisruptionData();
        } else {
            setDisruption({ ...INIT_EFFECT_STATE });
        }
    }, []);

    useEffect(() => {
        props.onDisruptionChange(disruption);
    }, [disruption]);

    useEffect(() => {
        if (props.disruptions && disruptionIncidentNoToEdit && !props.isNotesRequiresToUpdate) {
            initDisruptionData();
        }
    }, [props.disruptions]);

    useEffect(() => {
        if (Array.isArray(props.mapDrawingEntities) && props.mapDrawingEntities.length > 0) {
            setDisruption({
                ...disruption,
                affectedEntities: mergeExistingAndDrawnEntities(disruption.affectedEntities, props.mapDrawingEntities),
            });
        }
    }, [props.mapDrawingEntities]);

    useImperativeHandle(ref, () => ({
        deleteAffectedEntities() {
            setDisruption({
                ...disruption,
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
            });
        },
    }));

    const startTimeValid = () => {
        if (disruptionRecurrent && (disruption.status === STATUSES.RESOLVED || disruption.status === STATUSES.NOT_STARTED || disruption.status === STATUSES.DRAFT)) {
            const isTimeValid = isStartTimeValid(disruption.startDate, disruption.startTime, moment(modalOpenedTime), false);
            if (disruption.status === STATUSES.RESOLVED) {
                return isTimeValid;
            }
            return isTimeValid && !isStartDateTimeEarlierThanNow(disruption.startDate, disruption.startTime);
        }
        return isStartTimeValid(
            disruption.startDate,
            disruption.startTime,
            moment(modalOpenedTime),
            disruptionRecurrent,
        );
    };

    const impactValid = () => !isEmpty(disruption.impact);
    const severityValid = () => !isEmpty(disruption.severity);
    const durationValid = () => isDurationValid(disruption.duration, disruptionRecurrent);
    const endTimeValid = () => isEndTimeValid(
        disruption.endDate,
        disruption.endTime,
        disruption.startDate,
        disruption.startTime,
    );

    const endDateValid = () => isEndDateValid(disruption.endDate, disruption.startDate, disruptionRecurrent);

    const startDateValid = () => {
        if ((disruption.status === STATUSES.NOT_STARTED || disruption.status === STATUSES.DRAFT) && disruptionRecurrent) {
            return moment(disruption.startDate, DATE_FORMAT, true).isSameOrAfter(moment(), 'day');
        }

        return isStartDateValid(disruption.startDate, moment(modalOpenedTime), disruptionRecurrent);
    };

    const isDateTimeValid = () => startTimeValid() && startDateValid() && endDateValid() && durationValid();

    const titleValid = () => !isEmpty(disruption.header);

    const datePickerOptions = useMemo(() => (
        (disruption.status === STATUSES.NOT_STARTED || disruption.status === STATUSES.DRAFT) && disruptionRecurrent
            ? getDatePickerOptions('today')
            : getDatePickerOptions()
    ), [disruption.status, disruptionRecurrent]);

    const endDateDatePickerOptions = () => getDatePickerOptions(disruption.startDate || moment().second(0).millisecond(0));

    const updateDisruption = (updatedFields) => {
        setDisruption((prev) => {
            let recurrenceDates;
            let parsedRecurrencePattern;
            if (updatedFields?.startDate || updatedFields?.startTime || updatedFields?.endDate || updatedFields?.recurrent) {
                recurrenceDates = getRecurrenceDates(
                    updatedFields.startDate || prev.startDate,
                    updatedFields.startTime || prev.startTime,
                    updatedFields.endDate || prev.endDate,
                );
                parsedRecurrencePattern = prev.recurrent ? parseRecurrencePattern(prev.recurrencePattern) : { freq: RRule.WEEKLY };
            }
            const updatedDisruption = {
                ...prev,
                ...updatedFields,
                ...(recurrenceDates && {
                    recurrencePattern: {
                        ...prev.recurrencePattern,
                        ...parsedRecurrencePattern,
                        ...recurrenceDates,
                    },
                }),
                ...(updatedFields.endDate?.length && isEmpty(prev.endTime) && !updatedFields.endTime && { endTime: '23:59' }),
            };
            props.updateEditableDisruption(updatedDisruption);
            return updatedDisruption;
        });
    };

    const onChangeStartDate = (date) => {
        if (date.length === 0) {
            updateDisruption({ startDate: '' });
            setIsStartDateInvalid(true);
        } else {
            updateDisruption({ startDate: moment(date[0]).format(DATE_FORMAT) });
            setIsStartDateInvalid(false);
        }
        setIsStartDateDirty(true);
    };

    const onChangeEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0) {
                updateDisruption({ endDate: '' });
                setIsEndDateInvalid(true);
            } else {
                updateDisruption({ endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '' });
                setIsEndDateInvalid(false);
            }
        } else {
            updateDisruption({ endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '' });
            setIsEndDateInvalid(false);
        }
    };

    const onBlurEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0 && disruption.status !== STATUSES.DRAFT) {
                setIsEndDateInvalid(true);
            } else {
                setIsEndDateInvalid(false);
            }
        } else {
            setIsEndDateInvalid(false);
        }
    };

    const onUpdateRecurrencePattern = (byweekday) => {
        setIsRecurrencePatternDirty(true);
        setDisruption((prev) => {
            const updatedDisruption = {
                ...prev,
                recurrencePattern: { ...prev.recurrencePattern, byweekday },
            };
            props.updateEditableDisruption(updatedDisruption);
            return updatedDisruption;
        });
    };

    const isViewAllDisabled = () => !isDateTimeValid() || isEmpty(disruption.recurrencePattern?.byweekday);

    const displayActivePeriods = () => {
        setActivePeriods(generateActivePeriodsFromRecurrencePattern(
            disruption.recurrencePattern,
            disruption.duration,
        ));
        setActivePeriodsModalOpen(true);
    };

    const updateDisruptionState = (updatedDisruptions) => {
        setDisruption(updatedDisruptions);
        props.updateEditableDisruption(updatedDisruptions);
        setRequireMapUpdate(true);
        props.setDisruptionForWorkaroundEdit(updatedDisruptions);
        props.setRequireToUpdateWorkaroundsState(true);
    };

    const onAffectedEntitiesUpdate = (disruptionKey, valueKey, affectedEntities) => {
        const updatedDisruptions = {
            ...disruption,
            affectedEntities: {
                ...disruption.affectedEntities,
                [valueKey]: affectedEntities,
            },
        };
        updateDisruptionState(updatedDisruptions);

        if (props.onDisruptionsUpdate && props.disruptions) {
            const updatedDisruptionsList = props.disruptions.map(d => (
                d.incidentNo === disruption.incidentNo ? updatedDisruptions : d
            ));
            props.onDisruptionsUpdate('disruptions', updatedDisruptionsList);
        }
    };

    const resetAffectedEntities = () => {
        setDisruption((prev) => {
            const updatedDisruption = {
                ...prev,
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
            };
            props.updateEditableDisruption(updatedDisruption);
            return updatedDisruption;
        });
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
        if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.RESOLVED) {
            updateDisruption({
                startDate: moment().format(DATE_FORMAT),
                startTime: moment().format(TIME_FORMAT),
                endDate: moment().format(DATE_FORMAT),
                endTime: moment().format(TIME_FORMAT),
            });
            props.setDisruptionForWorkaroundEdit({
                ...disruption,
                status: selectedStatus,
            });
            props.setRequireToUpdateWorkaroundsState(true);
        } else if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.IN_PROGRESS) {
            updateDisruption({
                startDate: moment().format(DATE_FORMAT),
                startTime: moment().format(TIME_FORMAT),
            });
        } else if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.NOT_STARTED) {
            updateDisruption({
                startDate: moment(disruption.startTime).format(DATE_FORMAT),
                startTime: moment(disruption.startTime).format(TIME_FORMAT),
                endDate: '',
                endTime: '',
            });
        } else if (disruption.status === STATUSES.IN_PROGRESS && selectedStatus === STATUSES.RESOLVED) {
            updateDisruption({
                endDate: moment().format(DATE_FORMAT),
                endTime: moment().format(TIME_FORMAT),
            });
            props.setDisruptionForWorkaroundEdit({
                ...disruption,
                status: selectedStatus,
            });
            props.setRequireToUpdateWorkaroundsState(true);
        } else if (disruption.status === STATUSES.RESOLVED && selectedStatus !== STATUSES.RESOLVED) {
            props.setDisruptionForWorkaroundEdit({
                ...disruption,
                status: selectedStatus,
            });
            props.setRequireToUpdateWorkaroundsState(true);
        }
        updateDisruption({ status: selectedStatus });
    };

    const setDisruptionEntity = () => {
        const startDate = disruption.startDate ? disruption.startDate : moment(disruption.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, disruption.startTime);

        let endTimeMoment;
        if (!isEmpty(disruption.endDate) && !isEmpty(disruption.endTime)) {
            endTimeMoment = momentFromDateTime(disruption.endDate, disruption.endTime);
        }
        return {
            ...disruption,
            notes: [...disruption.notes, ...(disruption.note ? [{ description: disruption.note }] : [])],
            affectedEntities: [...disruption.affectedEntities.affectedRoutes, ...disruption.affectedEntities.affectedStops],
            endTime: endTimeMoment,
            startTime: startTimeMoment,
        };
    };

    const shareToEmailHandler = async () => {
        const disruptionEntity = setDisruptionEntity();
        shareToEmail(disruptionEntity);
    };

    const activePeriodsValidV2 = () => {
        if (disruption.recurrent) {
            return isActivePeriodsValid(disruption.recurrencePattern, disruption.duration, maxActivePeriodsCount);
        }
        return true;
    };

    const onBlurTitle = () => {
        setIsTitleDirty(true);
    };

    const closeWorkaroundPanel = () => {
        props.updateDisruptionKeyToWorkaroundEdit('');
        props.toggleWorkaroundPanel(false);
        props.setDisruptionForWorkaroundEdit({});
    };

    const openWorkaroundPanel = () => {
        if (disruption?.affectedEntities) {
            const { entitiesCount } = getEntityCounts(disruption);
            if (entitiesCount > MAX_NUMBER_OF_ENTITIES) {
                setTotalEntities(entitiesCount);
                setIsAlertModalOpen(true);
                return;
            }
        }

        props.setDisruptionForWorkaroundEdit(disruption);
        props.updateDisruptionKeyToWorkaroundEdit(props.disruptionIncidentNoToEdit);
        props.toggleWorkaroundPanel(true);
    };

    const isRequiredPropsEmpty = () => {
        const isPropsEmpty = some([disruption.startTime, disruption.startDate, disruption.impact, disruption.cause, disruption.header, disruption.severity], isEmpty);
        const isEndTimeRequiredAndEmpty = !disruption.recurrent && !isEmpty(disruption.endDate) && isEmpty(disruption.endTime);
        const isWeekdayRequiredAndEmpty = disruption.recurrent && isEmpty(disruption.recurrencePattern.byweekday);
        return isPropsEmpty || isEndTimeRequiredAndEmpty || isWeekdayRequiredAndEmpty;
    };

    const affectedEntitySelected = () => disruption.affectedEntities?.affectedRoutes?.length > 0
        || disruption.affectedEntities?.affectedStops?.length > 0;
    const isRequiredDraftPropsEmpty = () => some([disruption.header, disruption.cause], isEmpty);

    const isSubmitDisabled = isRequiredPropsEmpty()
        || !startTimeValid()
        || !startDateValid()
        || !endTimeValid()
        || !endDateValid()
        || !durationValid()
        || !affectedEntitySelected()
        || (disruptionRecurrent && !activePeriodsValidV2());
    const isDraftSubmitDisabled = isRequiredDraftPropsEmpty();

    const impacts = useAlertEffects();

    const onAddNote = (note) => {
        const startDate = originalDisruption.startDate ? originalDisruption.startDate : moment(originalDisruption.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, originalDisruption.startTime);

        let endTimeMoment;
        if (!isEmpty(originalDisruption.endDate) && !isEmpty(originalDisruption.endTime)) {
            endTimeMoment = momentFromDateTime(originalDisruption.endDate, originalDisruption.endTime);
        }
        const affectedEntities = [...originalDisruption.affectedEntities.affectedRoutes,
            ...originalDisruption.affectedEntities.affectedStops]
            .map(entity => omit(entity, ['shapeWkt']));
        const updatedDisruption = {
            ...originalDisruption,
            notes: [...originalDisruption.notes, { description: note }],
            affectedEntities,
            endTime: endTimeMoment,
            startTime: startTimeMoment,
        };
        props.updateDisruptionAction(updatedDisruption);
        updateDisruption({ note: '' });
    };

    const validateEntityLimit = () => {
        const { entitiesCount } = getEntityCounts(disruption);
        if (entitiesCount > MAX_NUMBER_OF_ENTITIES) {
            setTotalEntities(entitiesCount);
            setIsAlertModalOpen(true);
            return false;
        }
        return true;
    };

    const onSubmit = () => {
        if (!validateEntityLimit()) {
            return;
        }

        props.applyDisruptionChanges(disruption);
        props.toggleEditEffectPanel(false);
        props.updateDisruptionKeyToEditEffect('');
        props.setDisruptionForWorkaroundEdit({});
        closeWorkaroundPanel();
        if (props.mapDrawingEntities.length > 0) {
            props.clearMapDrawingEntities();
        }
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
            if (Array.isArray(d?.affectedEntities?.affectedStops)) {
                const filterStops = d.affectedEntities.affectedStops.filter(stop => stop.stopCode !== 'Not Found');
                if (filterStops.length !== d.affectedEntities.affectedStops.length) {
                    onAffectedEntitiesUpdate(d.key, 'affectedStops', filterStops);
                }
            }
        });
    };

    useEffect(() => {
        if (!props.isEditEffectPanelOpen) {
            removeNotFoundFromStopGroupsForAllDisruptions();
            const routes = disruptions.map(d => d.affectedEntities.affectedRoutes).flat();
            const stops = disruptions.map(d => d.affectedEntities.affectedStops).flat();

            props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));
            props.updateAffectedRoutesState(routes);

            if (routes.length > 0) {
                props.getRoutesByShortName(routes.slice(0, 10));
            }
        } else {
            setRequireMapUpdate(true);
        }
    }, [props.isEditEffectPanelOpen, props.disruptionIncidentNoToEdit]);

    const removeNotFoundFromStopGroups = () => {
        const filterStops = disruption.affectedEntities.affectedStops.filter(stop => stop.stopCode !== 'Not Found');
        if (filterStops.length !== disruption.affectedEntities.affectedStops.length) {
            onAffectedEntitiesUpdate(disruption.key, 'affectedStops', filterStops);
        }
    };

    useEffect(() => {
        if (requireMapUpdate) {
            removeNotFoundFromStopGroups();
            const routes = (disruption.affectedEntities.affectedRoutes).flat();
            const stops = (disruption.affectedEntities.affectedStops).flat();

            props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));
            props.updateAffectedRoutesState(routes);

            if (routes.length > 0) {
                props.getRoutesByShortName(routes.slice(0, 10));
            }
            setRequireMapUpdate(false);
        }
    }, [requireMapUpdate]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit && disruptions && disruptions.length > 0) {
            initDisruptionData();
        } else {
            setDisruption({ ...INIT_EFFECT_STATE });
        }
    }, [disruptionIncidentNoToEdit]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit && props.isNotesRequiresToUpdate) {
            updateDisruption({ notes: (disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit).notes) });
            setOriginalDisruption(disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit));
            props.updateIsNotesRequiresToUpdateState();
        }
    }, [props.isNotesRequiresToUpdate]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit && props.isWorkaroundsRequiresToUpdate && Array.isArray(props.workaroundsToSync)) {
            updateDisruption({ workarounds: props.workaroundsToSync });
            props.updateIsWorkaroundsRequiresToUpdateState();
        }
    }, [props.isWorkaroundsRequiresToUpdate]);

    const isValuesChanged = !isEqual(disruption, originalDisruption);
    const isResolved = () => disruption.status === STATUSES.RESOLVED;

    const discardEffectChanges = () => {
        if (props.newDisruptionKey === '') { // discard change and close edit effect panel
            props.toggleWorkaroundPanel(false);
            props.toggleEditEffectPanel(false);
            props.updateEditableDisruption({});
        } else {
            props.setDisruptionForWorkaroundEdit(disruptions.find(d => d.incidentNo === props.newDisruptionKey));
        }
        props.updateDisruptionKeyToEditEffect(props.newDisruptionKey);
        props.updateDisruptionKeyToWorkaroundEdit(props.newDisruptionKey);
        props.setRequestedDisruptionKeyToUpdateEditEffect('');
        props.setRequestToUpdateEditEffectState(false);
        props.toggleIncidentModals('isCancellationEffectOpen', false);
        if (props.mapDrawingEntities.length > 0) {
            props.clearMapDrawingEntities();
        }
    };

    useEffect(() => {
        if (props.isEditEffectUpdateRequested) {
            if (!props.isEditEffectPanelOpen && props.newDisruptionKey) { // open edit effect panel
                props.setDisruptionForWorkaroundEdit(disruptions.find(d => d.incidentNo === props.newDisruptionKey));
                props.updateDisruptionKeyToEditEffect(props.newDisruptionKey);
                props.updateDisruptionKeyToWorkaroundEdit(props.newDisruptionKey);
                setTimeout(() => props.toggleEditEffectPanel(true), 0);
                props.setRequestedDisruptionKeyToUpdateEditEffect('');
                props.setRequestToUpdateEditEffectState(false);
            } else if (isValuesChanged) { // open modal
                props.toggleIncidentModals('isCancellationEffectOpen', true);
            } else if (props.newDisruptionKey === '') { // close edit effect panel
                closeWorkaroundPanel();
                props.toggleEditEffectPanel(false);
                props.updateDisruptionKeyToEditEffect('');
                props.setRequestedDisruptionKeyToUpdateEditEffect('');
                props.setRequestToUpdateEditEffectState(false);
            } else if (props.newDisruptionKey !== '') { // change disruption in edit effect panel
                props.setDisruptionForWorkaroundEdit(disruptions.find(d => d.incidentNo === props.newDisruptionKey));
                props.updateDisruptionKeyToEditEffect(props.newDisruptionKey);
                props.updateDisruptionKeyToWorkaroundEdit(props.newDisruptionKey);
                props.setRequestedDisruptionKeyToUpdateEditEffect('');
                props.setRequestToUpdateEditEffectState(false);
            }
        }
    }, [props.isEditEffectUpdateRequested]);

    useEffect(() => {
        if (disruption.status === STATUSES.NOT_STARTED && disruptionRecurrent) {
            return;
        }

        const startDateTime = momentFromDateTime(disruption.startDate, disruption.startTime, now);
        if (startDateTime?.isValid() && disruption.status !== STATUSES.RESOLVED) {
            if (startDateTime.isAfter(now) && disruption.status === STATUSES.IN_PROGRESS) {
                updateDisruption({ status: STATUSES.NOT_STARTED });
            } else if (startDateTime.isSameOrBefore(now) && disruption.status === STATUSES.NOT_STARTED) {
                updateDisruption({ status: STATUSES.IN_PROGRESS });
            }
        }
    }, [disruption.startDate, disruption.startTime, disruption.endDate]);

    const isDateTimeEarlierThanNow = useMemo(() => (
        disruption.status === STATUSES.NOT_STARTED && disruptionRecurrent
            ? isStartDateTimeEarlierThanNow(disruption.startDate, disruption.startTime)
            : false
    ), [disruption.status, disruptionRecurrent, disruption.startDate, disruption.startTime]);

    const isApplyDisabled = (() => {
        if (disruption.status === STATUSES.DRAFT) {
            return isDraftSubmitDisabled;
        }

        if ((disruption.status === STATUSES.NOT_STARTED || disruption.status === STATUSES.RESOLVED) && disruptionRecurrent) {
            const baseChecks = some([disruption.impact, disruption.cause, disruption.header, disruption.severity], isEmpty)
                || (disruption.recurrent && isEmpty(disruption.recurrencePattern.byweekday))
                || !affectedEntitySelected();

            if (disruption.status === STATUSES.NOT_STARTED) {
                return baseChecks
                    || !startTimeValid()
                    || !startDateValid()
                    || !endDateValid()
                    || !durationValid()
                    || (disruptionRecurrent && !activePeriodsValidV2())
                    || isDateTimeEarlierThanNow;
            }

            return baseChecks;
        }

        return isSubmitDisabled;
    })();

    const diversionsCount = localDiversions.length;
    const isAddDiversionEnabled = () => {
        if (!disruption?.disruptionId) return false;

        if (disruption.status === STATUSES.RESOLVED) {
            return false;
        }

        const routes = disruption.affectedEntities?.affectedRoutes || [];

        if (routes.length === 0) {
            return false;
        }

        const hasBusRoutes = routes.some(route => route.routeType === 3);
        const hasOnlyTrainRoutes = routes.every(route => route.routeType === 2);

        if (!hasBusRoutes || hasOnlyTrainRoutes) {
            return false;
        }

        const validStatuses = [STATUSES.NOT_STARTED, STATUSES.IN_PROGRESS, STATUSES.DRAFT];
        return validStatuses.includes(disruption.status);
    };
    const handleViewDiversions = () => {
        setIsViewDiversionsModalOpen(true);
    };
    const handleAddDiversion = () => {
        if (!props.isDiversionManagerOpen) {
            props.updateDiversionMode(EDIT_TYPE.CREATE);
            props.openDiversionManager(true);
        }
    };

    const handleMenuClick = () => {
        setIsDiversionMenuOpen(!isDiversionMenuOpen);
    };

    useEffect(() => {
        props.updateEffectValidationState(!isApplyDisabled);
    }, [isApplyDisabled]);

    useEffect(() => {
        props.updateEffectValidationForPublishState(!isSubmitDisabled);
    }, [isSubmitDisabled]);

    useEffect(() => {
        props.updateIsEffectUpdatedState(isValuesChanged);
    }, [isValuesChanged]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDiversionMenuOpen && !event.target.closest('[data-diversion-menu]')) {
                setIsDiversionMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDiversionMenuOpen]);

    useEffect(() => {
        const fetchDisruptionForDiversion = async () => {
            if (shouldRefetchDiversions || (props.isDiversionManagerOpen && disruption?.disruptionId && !fetchedDisruption)) {
                setShouldRefetchDiversions(false);
                setIsLoadingDisruption(true);
                const disruptionData = await getDisruptionAPI(disruption.disruptionId);
                setFetchedDisruption(disruptionData);
                setIsLoadingDisruption(false);
            }
        };

        fetchDisruptionForDiversion();
    }, [props.isDiversionManagerOpen, disruption?.disruptionId, fetchedDisruption, shouldRefetchDiversions]);

    // When disruption is refreshed from API (usually via diversion modal), we need to update local states with these updates
    useEffect(() => {
        updateDisruptionWithFetchData(fetchedDisruption, disruption, updateDisruptionState);
    }, [fetchedDisruption]);

    useEffect(() => {
        if (props.isDiversionManagerOpen) {
            setIsLoaderProtected(true);
        } else {
            setFetchedDisruption(null);
            setIsLoaderProtected(props.isDiversionManagerLoading);
        }
    }, [props.isDiversionManagerOpen, props.isDiversionManagerLoading]);

    useEffect(() => {
        if (props.isDiversionManagerOpen && props.isDiversionManagerReady) {
            setIsLoaderProtected(false);
        }
    }, [props.isDiversionManagerOpen, props.isDiversionManagerReady]);

    useEffect(() => {
        document.body.classList.toggle('diversion-loading', isLoaderProtected);

        return () => {
            document.body.classList.remove('diversion-loading');
        };
    }, [isLoaderProtected]);

    useEffect(() => {
        if (props.isDiversionManagerOpen && (!disruption?.disruptionId || disruption?.disruptionId === '')) {
            props.openDiversionManager(false);
        }
    }, [props.isDiversionManagerOpen, disruption?.disruptionId]);

    useEffect(() => {
        const fetchDiversions = async () => {
            if (!disruption?.disruptionId) {
                setLocalDiversions([]);
                return;
            }

            const data = await getDiversionAPI(disruption?.disruptionId);
            setLocalDiversions(data || []);
        };
        fetchDiversions();
    }, [disruption?.disruptionId, shouldRefetchDiversions]);

    useEffect(() => {
        if (isDateFieldValid(props.incidentDateRange.startDate) && isTimeFieldValid(props.incidentDateRange.startTime)) {
            const updatedDisruptions = disruptions.map(d => (d.incidentNo === disruptionIncidentNoToEdit
                ? { ...d, startDate: disruption.startDate, startTime: disruption.startTime }
                : d));
            const start = startDateTimeWillBeAutomaticallyUpdated(props.incidentDateRange.startDate, props.incidentDateRange.startTime, updatedDisruptions);
            props.updateStartDateTimeWillBeUpdated(start);
        } else if (!isDateFieldValid(props.incidentDateRange.startDate) || !isTimeFieldValid(props.incidentDateRange.startTime)) {
            props.updateStartDateTimeWillBeUpdated(false);
        }
    }, [props.incidentDateRange.startDate, props.incidentDateRange.startTime, disruption.startDate, disruption.startTime]);

    useEffect(() => {
        if (isDateFieldValid(props.incidentDateRange.endDate) && isTimeFieldValid(props.incidentDateRange.endTime)) {
            const updatedDisruptions = disruptions.map(d => (d.incidentNo === disruptionIncidentNoToEdit
                ? { ...d, endDate: disruption.endDate, endTime: disruption.endTime }
                : d));
            const end = endDateTimeWillBeAutomaticallyUpdated(props.incidentDateRange.endDate, props.incidentDateRange.endTime, updatedDisruptions, disruptionRecurrent);
            props.updateEndDateTimeWillBeUpdated(end);
        } else if (!isDateFieldValid(props.incidentDateRange.endDate) || !isTimeFieldValid(props.incidentDateRange.endTime)) {
            props.updateEndDateTimeWillBeUpdated(false);
        }
    }, [props.incidentDateRange.endDate, props.incidentDateRange.endTime, disruption.endDate, disruption.endTime]);

    useEffect(() => () => {
        document.body.classList.remove('diversion-loading');
        isMounted.current = false;
        setDisruption({ ...INIT_EFFECT_STATE });
        setLocalDiversions([]);
        setIsLoadingDisruption(false);
        setIsLoaderProtected(false);
    }, []);

    if (!disruption || !disruptions || disruptions.length === 0) {
        return null;
    }

    if (props.useDiversion && props.isDiversionManagerOpen) {
        if (isLoadingDisruption) {
            return <div>Loading...</div>;
        }

        if (fetchedDisruption) {
            return (
                <DiversionManager
                    disruption={ fetchedDisruption }
                    onCancelled={ () => {
                        props.openDiversionManager(false);
                        setShouldRefetchDiversions(prev => !prev);
                    } }
                />
            );
        }

        return <div>Failed to load disruption data.</div>;
    }

    const itemsSelectedText = () => {
        const { routesCount, stopsCount } = getEntityCounts(disruption);
        return generateSelectedText(routesCount, stopsCount);
    };

    return (
        <div className={ `edit-effect-panel ${!props.isEditEffectPanelOpen ? 'pointer-event-none' : ''}` }>
            { props.isEditEffectPanelOpen && (
                <Paper component={ Stack } direction="column" justifyContent="center" className="mui-paper">
                    <div className="edit-effect-panel-body effect-background-color">
                        <div className="label-with-icon">
                            <h2 className="pl-4 pr-4 pt-4">{ `Edit details of Effect ${disruption.incidentNo}` }</h2>
                            <div style={ { display: 'flex', alignItems: 'center', gap: '10px' } }>
                                {props.useDiversion && (
                                    <div style={ { position: 'relative' } } data-diversion-menu>
                                        <MuiButton
                                            className="diversion-button-custom"
                                            onClick={ handleMenuClick }
                                            variant="contained"
                                        >
                                            <span>
                                                Diversions(
                                                { diversionsCount }
                                                )
                                            </span>
                                            <GiDetour size="26" />
                                        </MuiButton>
                                        {isDiversionMenuOpen && (
                                            <div className="diversion-menu">
                                                <MuiButton
                                                    fullWidth
                                                    disabled={ !isAddDiversionEnabled() }
                                                    onClick={ () => {
                                                        handleAddDiversion();
                                                        setIsDiversionMenuOpen(false);
                                                    } }
                                                    variant="text"
                                                    sx={ { justifyContent: 'flex-start' } }
                                                >
                                                    Add Diversion
                                                </MuiButton>
                                                <MuiButton
                                                    fullWidth
                                                    onClick={ () => {
                                                        handleViewDiversions();
                                                        setIsDiversionMenuOpen(false);
                                                    } }
                                                    variant="text"
                                                    sx={ { justifyContent: 'flex-start' } }
                                                >
                                                    View & Edit Diversions
                                                </MuiButton>
                                            </div>
                                        )}
                                    </div>
                                )}
                                { props.isWorkaroundPanelOpen
                                    && (
                                        <KeyboardDoubleArrowLeftIcon onClick={ closeWorkaroundPanel }
                                            className="collapse-icon"
                                            style={ { color: '#399CDB', fontSize: '48px' } } />
                                    )}
                                { !props.isWorkaroundPanelOpen
                                    && (
                                        <KeyboardDoubleArrowRightIcon onClick={ openWorkaroundPanel }
                                            className="collapse-icon"
                                            style={ { color: '#399CDB', fontSize: '48px' } } />
                                    )}
                            </div>
                        </div>
                        <Form key="form" className="row my-3 p-4 incident-effect">
                            <div className="col-12">
                                <FormGroup>
                                    <Label for="disruption-creation__wizard-select-details__header">
                                        <span className="font-size-md font-weight-bold">{LABEL_EFFECT_HEADER}</span>
                                    </Label>
                                    <Input
                                        id="disruption-creation__wizard-select-details__header"
                                        className="w-100 border border-dark effect-background-color"
                                        placeholder="Title of the message"
                                        maxLength={ HEADER_MAX_LENGTH }
                                        onChange={ event => updateDisruption({ header: event.target.value }) }
                                        onBlur={ onBlurTitle }
                                        value={ disruption.header }
                                        invalid={ isTitleDirty && !titleValid() }
                                        disabled={ isResolved() }
                                    />
                                    <FormFeedback>Please enter effect title</FormFeedback>
                                </FormGroup>
                            </div>
                            <div className="col-6">
                                <FormGroup>
                                    <DisruptionDetailSelect
                                        id="disruption-creation__wizard-select-details__impact"
                                        className=""
                                        value={ disruption.impact }
                                        options={ impacts }
                                        label={ LABEL_CUSTOMER_IMPACT }
                                        invalid={ isImpactDirty && !impactValid() && disruption.status !== STATUSES.DRAFT }
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
                                        disabled={ disruption.status === STATUSES.DRAFT }
                                        disabledClassName="background-color-for-disabled-fields"
                                        value={ disruption.status }
                                        options={ getStatusOptions(disruption.startDate, disruption.startTime, now, disruption.status) }
                                        label={ LABEL_STATUS }
                                        onChange={ setDisruptionStatus } />
                                </FormGroup>
                            </div>
                            <div className="col-6">
                                <FormGroup className="position-relative">
                                    <Label for="disruption-creation__wizard-select-details__start-date">
                                        <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                                    </Label>
                                    <div className={ `${isResolved() || (disruptionRecurrent && disruption.status !== STATUSES.DRAFT && disruption.status !== STATUSES.NOT_STARTED) ? 'background-color-for-disabled-fields' : ''}` }>
                                        <Flatpickr
                                            data-testid="start-date_date-picker"
                                            key="start-date"
                                            id="disruption-creation__wizard-select-details__start-date"
                                            className={ `font-weight-normal cc-form-control form-control ${isStartDateInvalid ? 'is-invalid' : ''}` }
                                            value={ disruption.startDate }
                                            options={ datePickerOptions }
                                            placeholder="Select date"
                                            onChange={ date => onChangeStartDate(date) }
                                            disabled={ isResolved() || (disruptionRecurrent && disruption.status !== STATUSES.DRAFT && disruption.status !== STATUSES.NOT_STARTED) }
                                        />
                                    </div>
                                    {!isStartDateInvalid && (
                                        <FaRegCalendarAlt
                                            className="disruption-creation__wizard-select-details__icon position-absolute"
                                            size={ 22 } />
                                    )}
                                    {isStartDateInvalid && (
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
                                            data-testid="end-date_date-picker"
                                            key="end-date"
                                            id="disruption-creation__wizard-select-details__end-date"
                                            className={ `font-weight-normal cc-form-control form-control ${isEndDateInvalid ? 'is-invalid' : ''}` }
                                            value={ disruption.endDate }
                                            options={ endDateDatePickerOptions() }
                                            onChange={ date => onChangeEndDate(date, disruptionRecurrent) }
                                            onOpen={ date => onBlurEndDate(date, false) }
                                            disabled={ isResolved() }
                                        />
                                    </div>
                                    {!isEndDateInvalid && (
                                        <FaRegCalendarAlt
                                            className="disruption-creation__wizard-select-details__icon position-absolute"
                                            size={ 22 } />
                                    )}
                                    {isEndDateInvalid && (
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
                                        data-testid="start-time_input"
                                        id="disruption-creation__wizard-select-details__start-time"
                                        className="border border-dark effect-background-color"
                                        value={ disruption.startTime }
                                        onChange={ (event) => {
                                            updateDisruption({ startTime: event.target.value });
                                            setIsStartTimeDirty(true);
                                        } }
                                        invalid={ (disruption.status === STATUSES.DRAFT ? ((isStartTimeDirty || isStartDateDirty) && !startTimeValid()) : !startTimeValid()) }
                                        disabled={ isResolved() || (disruptionRecurrent && disruption.status !== STATUSES.DRAFT && disruption.status !== STATUSES.NOT_STARTED) }
                                    />
                                    <FormFeedback>Not valid values</FormFeedback>
                                </FormGroup>
                                {!disruptionRecurrent && (
                                    <FormGroup>
                                        <Label for="disruption-creation__wizard-select-details__end-time">
                                            <span className="font-size-md font-weight-bold">{getOptionalLabel(LABEL_END_TIME)}</span>
                                        </Label>
                                        <Input
                                            data-testid="end-time_input"
                                            id="disruption-creation__wizard-select-details__end-time"
                                            className="border border-dark effect-background-color"
                                            value={ disruption.endTime }
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
                                            className="border border-dark effect-background-color"
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
                            { disruptionRecurrent && (
                                <>
                                    <div className="col-6 text-center">
                                        <WeekdayPicker
                                            selectedWeekdays={ disruption.recurrencePattern.byweekday || [] }
                                            onUpdate={ byweekday => onUpdateRecurrencePattern(byweekday) }
                                            disabled={ isResolved() }
                                        />
                                    </div>
                                    <div className="col-6 pb-3 text-center">
                                        <Button
                                            disabled={ isViewAllDisabled() }
                                            className="showActivePeriods btn btn-secondary lh-1"
                                            onClick={ () => displayActivePeriods() }
                                        >
                                            View All
                                        </Button>
                                    </div>
                                    { (!isEmpty(disruption.recurrencePattern.byweekday) && activePeriodsValidV2()) && (
                                        <div className="col-12 mb-3">
                                            <BsArrowRepeat size={ 22 } />
                                            <span className="pl-1">{ getRecurrenceText(parseRecurrencePattern(disruption.recurrencePattern)) }</span>
                                        </div>
                                    )}
                                    { (isRecurrencePatternDirty && (isEmpty(disruption.recurrencePattern.byweekday) || !activePeriodsValidV2()))
                                    && (
                                        <div className="col-12 mb-3">
                                            <span className="disruption-recurrence-invalid">Please select recurrence</span>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="col-6">
                                <FormGroup>
                                    <DisruptionDetailSelect
                                        id="disruption-creation__wizard-select-details__severity"
                                        className=""
                                        value={ disruption.severity }
                                        options={ getParentChildSeverityOptions() }
                                        label={ LABEL_SEVERITY }
                                        invalid={ isSeverityDirty && !severityValid() && disruption.status !== STATUSES.DRAFT }
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
                                        className="textarea-no-resize border border-dark effect-background-color"
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
                                            className="add-note-button cc-btn-secondary effect-background-color"
                                            onClick={ () => onAddNote(disruption.note) }
                                        >
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
                            <div className={ `${isResolved() ? 'disruption-display-block resolved-effect' : 'disruption-display-block'}` }>
                                <SelectEffectEntities
                                    disruptionKey={ disruption.key }
                                    affectedEntities={ disruption.affectedEntities }
                                    onAffectedEntitiesUpdate={ onAffectedEntitiesUpdate }
                                    resetAffectedEntities={ resetAffectedEntities }
                                    disruptionType={ disruption.disruptionType }
                                    onDisruptionTypeUpdate={ onDisruptionTypeUpdate }
                                    isEditDisabled={ isResolved() } />
                            </div>
                        </Form>
                    </div>
                    <footer className="row m-0 justify-content-end p-4 position-fixed incident-footer-min-height effect-background-color">
                        <div className="col-4">
                            <Button
                                className="btn cc-btn-primary btn-block save-workaround"
                                onClick={ () => setDisruptionsDetailsModalOpen(true) }
                            >
                                Preview & Share
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button
                                disabled={ isApplyDisabled }
                                className="btn cc-btn-primary btn-block save-workaround"
                                onClick={ () => shareToEmailHandler() }
                            >
                                Share to email
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button
                                disabled={ isApplyDisabled }
                                className="btn cc-btn-primary btn-block save-workaround"
                                onClick={ () => onSubmit() }
                            >
                                Apply
                            </Button>
                        </div>
                    </footer>
                </Paper>
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
                <CancellationEffectModal discardChanges={ () => discardEffectChanges() } />
            </CustomModal>
            {props.useDiversion && (
                <ViewDiversionDetailModal
                    disruption={ disruption }
                    onClose={ () => setIsViewDiversionsModalOpen(false) }
                    onEditDiversion={ (diversion) => {
                        props.updateDiversionMode(EDIT_TYPE.EDIT);
                        props.updateDiversionToEdit(diversion);
                        props.openDiversionManager(true);
                    } }
                    isOpen={ isViewDiversionsModalOpen }
                    setShouldRefetchDiversions={ setShouldRefetchDiversions }
                    diversions={ localDiversions }
                />
            )}
            <IncidentLimitModal
                isOpen={ isAlertModalOpen }
                onClose={ () => setIsAlertModalOpen(false) }
                totalEntities={ totalEntities }
                itemsSelectedText={ itemsSelectedText() }
                maxLimit={ MAX_NUMBER_OF_ENTITIES }
            />
        </div>
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
    incidentEndDate: PropTypes.string,
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
    isEditEffectUpdateRequested: PropTypes.bool.isRequired,
    newDisruptionKey: PropTypes.string.isRequired,
    setRequestToUpdateEditEffectState: PropTypes.func.isRequired,
    isCancellationEffectOpen: PropTypes.bool,
    toggleIncidentModals: PropTypes.func.isRequired,
    setRequestedDisruptionKeyToUpdateEditEffect: PropTypes.func.isRequired,
    updateEditableDisruption: PropTypes.func.isRequired,
    applyDisruptionChanges: PropTypes.func.isRequired,
    updateEffectValidationState: PropTypes.func.isRequired,
    updateIsEffectUpdatedState: PropTypes.func.isRequired,
    useDisruptionNotePopup: PropTypes.bool,
    useDiversion: PropTypes.bool,
    openDiversionManager: PropTypes.func.isRequired,
    updateDiversionMode: PropTypes.func.isRequired,
    updateDiversionToEdit: PropTypes.func.isRequired,
    isDiversionManagerOpen: PropTypes.bool,
    isDiversionManagerLoading: PropTypes.bool,
    isDiversionManagerReady: PropTypes.bool,
    updateEffectValidationForPublishState: PropTypes.func.isRequired,
    mapDrawingEntities: PropTypes.array.isRequired,
    onDisruptionChange: PropTypes.func,
    clearMapDrawingEntities: PropTypes.func.isRequired,
    onDisruptionsUpdate: PropTypes.func,
    incidentDateRange: PropTypes.object.isRequired,
    updateStartDateTimeWillBeUpdated: PropTypes.func.isRequired,
    updateEndDateTimeWillBeUpdated: PropTypes.func.isRequired,
};

EditEffectPanel.defaultProps = {
    isEditEffectPanelOpen: false,
    disruptionIncidentNoToEdit: '',
    incidentEndDate: '',
    isWorkaroundPanelOpen: false,
    workaroundsToSync: [],
    isCancellationEffectOpen: false,
    useDisruptionNotePopup: false,
    useDiversion: false,
    isDiversionManagerOpen: false,
    isDiversionManagerLoading: false,
    isDiversionManagerReady: false,
    onDisruptionChange: () => {},
    onDisruptionsUpdate: () => {},
};

export default connect(state => ({
    isEditEffectPanelOpen: isEditEffectPanelOpen(state),
    disruptionIncidentNoToEdit: getDisruptionKeyToEditEffect(state),
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
    isEditEffectUpdateRequested: isEditEffectUpdateRequested(state),
    newDisruptionKey: getRequestedDisruptionKeyToUpdateEditEffect(state),
    isCancellationEffectOpen: isCancellationEffectModalOpen(state),
    useDisruptionNotePopup: useDisruptionNotePopup(state),
    useDiversion: useDiversion(state),
    isDiversionManagerOpen: getIsDiversionManagerOpen(state),
    isDiversionManagerLoading: getIsDiversionManagerLoading(state),
    isDiversionManagerReady: getIsDiversionManagerReady(state),
    isDataLoading: isDataLoading(state),
    mapDrawingEntities: getMapDrawingEntities(state),
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
    setRequestToUpdateEditEffectState,
    toggleIncidentModals,
    setRequestedDisruptionKeyToUpdateEditEffect,
    openDiversionManager,
    updateDiversionMode,
    updateDiversionToEdit,
    updateDataLoading,
    clearMapDrawingEntities,
}, null, { forwardRef: true })(forwardRef(EditEffectPanel));
