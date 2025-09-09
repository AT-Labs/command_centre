import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { Paper, Stack } from '@mui/material';
import { isEmpty, sortBy, some, isEqual } from 'lodash-es';
import { Form, FormFeedback, FormGroup, Input, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { FaRegCalendarAlt } from 'react-icons/fa';
import Flatpickr from 'react-flatpickr';
import { RRule } from 'rrule';
import moment from 'moment';
import { BsArrowRepeat } from 'react-icons/bs';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import HistoryIcon from '@mui/icons-material/History';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { isEditEffectPanelOpen,
    getDisruptionKeyToEditEffect,
    isWorkaroundPanelOpen,
    isEditEffectUpdateRequested,
    getRequestedDisruptionKeyToUpdateEditEffect,
    isCancellationEffectModalOpen,
    isRequiresToUpdateNotes,
    isWorkaroundsNeedsToBeUpdated,
} from '../../../../../redux/selectors/control/incidents';
import { isLoading as isDataLoading } from '../../../../../redux/selectors/activity';
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
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
    isDurationValid,
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
import { DISRUPTION_TYPE, SEVERITIES, DEFAULT_SEVERITY, STATUSES } from '../../../../../types/disruptions-types';
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
import { getIsDiversionManagerOpen } from '../../../../../redux/selectors/control/diversions';
import { ViewDiversionDetailModal } from '../../../DisruptionsView/DisruptionDetail/ViewDiversionDetailModal';
import { openDiversionManager, updateDiversionMode } from '../../../../../redux/actions/control/diversions';
import EDIT_TYPE from '../../../../../types/edit-types';
import detourIcon from '../../../../../assets/img/detour.svg';
import DiversionManager from '../../../DisruptionsView/DiversionManager';
import { getDisruption as getDisruptionAPI, getDiversion as getDiversionAPI } from '../../../../../utils/transmitters/disruption-mgt-api';

const INIT_EFFECT_STATE = {
    key: '',
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
    const [originalDisruption, setOriginalDisruption] = useState({ ...INIT_EFFECT_STATE });
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
    const [isRecurrencePatternDirty, setIsRecurrencePatternDirty] = useState(false);
    const [historyNotesModalOpen, setHistoryNotesModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [requireMapUpdate, setRequireMapUpdate] = useState(false);
    const [disruptionsDetailsModalOpen, setDisruptionsDetailsModalOpen] = useState(false);

    // Diversion-related state
    const [anchorEl, setAnchorEl] = useState(null);
    const [isViewDiversionsModalOpen, setIsViewDiversionsModalOpen] = useState(false);
    const [fetchedDisruption, setFetchedDisruption] = useState(null);
    const [isLoadingDisruption, setIsLoadingDisruption] = useState(false);
    const [localDiversions, setLocalDiversions] = useState([]);
    const [shouldRefetchDiversions, setShouldRefetchDiversions] = useState(false);
    const [isLoaderProtected, setIsLoaderProtected] = useState(false);
    const isMounted = useRef(true);
    const startTimeValid = () => isStartTimeValid(
        disruption.startDate,
        disruption.startTime,
        moment(modalOpenedTime),
        disruptionRecurrent,
    );

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

    const startDateValid = () => isStartDateValid(disruption.startDate, moment(modalOpenedTime), disruptionRecurrent);

    const isDateTimeValid = () => startTimeValid() && startDateValid() && endDateValid() && durationValid();

    const titleValid = () => !isEmpty(disruption.header);

    const datePickerOptions = getDatePickerOptions();

    const endDateDatePickerOptions = () => getDatePickerOptions(disruption.startDate || moment().second(0).millisecond(0));

    const updateDisruption = (updatedFields) => {
        let recurrenceDates;
        let parsedRecurrencePattern;
        if (updatedFields?.startDate || updatedFields?.startTime || updatedFields?.endDate || updatedFields?.recurrent) {
            recurrenceDates = getRecurrenceDates(
                updatedFields.startDate || disruption.startDate,
                updatedFields.startTime || disruption.startTime,
                updatedFields.endDate || disruption.endDate,
            );
            parsedRecurrencePattern = disruption.recurrent ? parseRecurrencePattern(disruption.recurrencePattern) : { freq: RRule.WEEKLY };
        }
        setDisruption((prev) => {
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
            };
            props.updateEditableDisruption(updatedDisruption);
            return updatedDisruption;
        });
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
                if (disruption.status === STATUSES.DRAFT) {
                    updateDisruption({ endDate: '', isEndDateDirty: false });
                } else {
                    updateDisruption({ isEndDateDirty: true });
                    setIsEndDateDirty(true);
                }
            } else {
                updateDisruption({ endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '' });
                setIsEndDateDirty(false);
            }
        } else {
            updateDisruption({ endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '' });
            setIsEndDateDirty(false);
        }
    };

    const onBlurEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0 && disruption.status !== STATUSES.DRAFT) {
                setIsEndDateDirty(true);
            } else {
                setIsEndDateDirty(false);
            }
        } else {
            setIsEndDateDirty(false);
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

    const onAffectedEntitiesUpdate = (disruptionKey, valueKey, affectedEntities) => {
        const updatedDisruptions = {
            ...disruption,
            affectedEntities: {
                ...disruption.affectedEntities,
                [valueKey]: affectedEntities,
            },
        };
        setDisruption(updatedDisruptions);
        props.updateEditableDisruption(updatedDisruptions);
        setRequireMapUpdate(true);
        props.setDisruptionForWorkaroundEdit(updatedDisruptions);
        props.setRequireToUpdateWorkaroundsState(true);
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
            return isActivePeriodsValid(disruption.recurrencePattern, disruption.duration, disruption.maxActivePeriodsCount);
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
        props.setDisruptionForWorkaroundEdit(disruption);
        props.updateDisruptionKeyToWorkaroundEdit(props.disruptionIncidentNoToEdit);
        props.toggleWorkaroundPanel(true);
    };

    const isRequiredPropsEmpty = () => {
        if (!disruption || !disruption.disruptionId) return true;
        
        const isPropsEmpty = some([disruption.startTime, disruption.startDate, disruption.impact, disruption.cause, disruption.header, disruption.severity], isEmpty);
        const isEndTimeRequiredAndEmpty = !disruption.recurrent && !isEmpty(disruption.endDate) && isEmpty(disruption.endTime);
        const isWeekdayRequiredAndEmpty = disruption.recurrent && isEmpty(disruption.recurrencePattern?.byweekday);
        return isPropsEmpty || isEndTimeRequiredAndEmpty || isWeekdayRequiredAndEmpty;
    };

    const affectedEntitySelected = () => disruption?.affectedEntities?.affectedRoutes?.length > 0 || disruption?.affectedEntities?.affectedStops?.length > 0;
    const isRequiredDraftPropsEmpty = () => some([disruption?.header, disruption?.cause], isEmpty);

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
            notes: [...originalDisruption.notes, { description: note }],
            affectedEntities: [...originalDisruption.affectedEntities.affectedRoutes, ...originalDisruption.affectedEntities.affectedStops],
            endTime: endTimeMoment,
            startTime: startTimeMoment,
        };
        props.updateDisruptionAction(updatedDisruption);
        updateDisruption({ note: '' });
    };

    const onSubmit = () => {
        props.applyDisruptionChanges(disruption);
        props.toggleEditEffectPanel(false);
        props.updateDisruptionKeyToEditEffect('');
        props.setDisruptionForWorkaroundEdit({});
        closeWorkaroundPanel();
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
            if (d && d.affectedEntities && d.affectedEntities.affectedStops && Array.isArray(d.affectedEntities.affectedStops)) {
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
                props.getRoutesByShortName(routes);
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
                props.getRoutesByShortName(routes);
            }
            setRequireMapUpdate(false);
        }
    }, [requireMapUpdate]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit) {
            const disruptionToSet = disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit);
            setDisruption(disruptionToSet);
            props.updateEditableDisruption(disruptionToSet);
            setOriginalDisruption(disruptionToSet);
            props.setDisruptionForWorkaroundEdit(disruptionToSet);
            props.updateIsNotesRequiresToUpdateState();
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
        if (disruptionIncidentNoToEdit && props.isWorkaroundsRequiresToUpdate && props.workaroundsToSync.length > 0) {
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
        const startDateTime = momentFromDateTime(disruption.startDate, disruption.startTime, now);
        if (startDateTime?.isValid() && disruption.status !== STATUSES.RESOLVED) {
            if (startDateTime.isAfter(now) && disruption.status === STATUSES.IN_PROGRESS) {
                updateDisruption({ status: STATUSES.NOT_STARTED });
            } else if (startDateTime.isSameOrBefore(now) && disruption.status === STATUSES.NOT_STARTED) {
                updateDisruption({ status: STATUSES.IN_PROGRESS });
            }
        }
    }, [disruption.startDate, disruption.startTime, disruption.endDate]);

    const isApplyDisabled = disruption.status === STATUSES.DRAFT ? isDraftSubmitDisabled : isSubmitDisabled;

    // Diversion-related logic
    const diversionsCount = localDiversions.length;
    const isAddDiversionEnabled = () => {
        if (!disruption || !disruption.disruptionId) return false;
        
        if (disruption.status === STATUSES.RESOLVED) {
            return false;
        }
        const hasBusRoutes = disruption.affectedEntities?.affectedRoutes?.some(route => route.routeType === 3);
        if (!hasBusRoutes) {
            return false;
        }
        const validStatuses = [STATUSES.NOT_STARTED, STATUSES.IN_PROGRESS, STATUSES.DRAFT];
        return validStatuses.includes(disruption.status);
    };
    const handleViewDiversions = () => {
        setIsViewDiversionsModalOpen(true);
    };
    const handleAddDiversion = () => {
        // Check if diversion manager is already open to prevent errors
        if (!props.isDiversionManagerOpen) {
            props.updateDiversionMode(EDIT_TYPE.CREATE);
            props.openDiversionManager(true);
        }
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    useEffect(() => {
        props.updateEffectValidationState(!isApplyDisabled);
    }, [isApplyDisabled]);

    useEffect(() => {
        props.updateIsEffectUpdatedState(isValuesChanged);
    }, [isValuesChanged]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (anchorEl && !event.target.closest('[data-diversion-menu]')) {
                setAnchorEl(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [anchorEl]);

    useEffect(() => {
        const fetchDisruptionForDiversion = async () => {
            if (props.isDiversionManagerOpen && disruption.disruptionId && !fetchedDisruption) {
                setIsLoadingDisruption(true);
                try {
                    const disruptionData = await getDisruptionAPI(disruption.disruptionId);
                    setFetchedDisruption(disruptionData);
                } catch (error) {
                    // Error handled silently
                } finally {
                    setIsLoadingDisruption(false);
                }
            }
        };

        fetchDisruptionForDiversion();
    }, [props.isDiversionManagerOpen, disruption.disruptionId, fetchedDisruption]);

    useEffect(() => {
        if (!props.isDiversionManagerOpen) {
            setFetchedDisruption(null);
        }
    }, [props.isDiversionManagerOpen]);

    useEffect(() => {
        if (props.isDiversionManagerOpen) {
            setIsLoaderProtected(true);
            
            const timeout = setTimeout(() => {
                setIsLoaderProtected(false);
                // Keep the loader active until map holder appears
            }, 2000);
            
            return () => {
                clearTimeout(timeout);
            };
        } else {
            // Deactivate when diversion manager is closed
            setIsLoaderProtected(false);
        }
    }, [props.isDiversionManagerOpen]);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (isLoaderProtected) {
                document.body.classList.add('diversion-loading');
            } else {
                document.body.classList.remove('diversion-loading');
            }
        }
        
        return () => {
            if (typeof document !== 'undefined') {
                document.body.classList.remove('diversion-loading');
            }
        };
    }, [isLoaderProtected]);


    // Prevent reopening diversion manager if already open
    useEffect(() => {
        if (props.isDiversionManagerOpen && !disruption?.disruptionId) {
            // Close diversion manager if no disruption is available
            props.openDiversionManager(false);
        }
    }, [props.isDiversionManagerOpen, disruption?.disruptionId]);

    useEffect(() => {
        const fetchDiversions = async () => {
            if (!disruption?.disruptionId) {
                setLocalDiversions([]);
                return;
            }
            
            try {
                const data = await getDiversionAPI(disruption.disruptionId);
                setLocalDiversions(data || []);
            } catch (error) {
                setLocalDiversions([]);
            }
        };
        fetchDiversions();
    }, [disruption?.disruptionId, shouldRefetchDiversions]);

    useEffect(() => {
        return () => {
            if (typeof document !== 'undefined') {
                document.body.classList.remove('diversion-loading');
            }
            isMounted.current = false;
            setDisruption({ ...INIT_EFFECT_STATE });
            setLocalDiversions([]);
            setIsLoadingDisruption(false);
            setIsLoaderProtected(false);
        };
    }, []);

    if (!disruptions || disruptions.length === 0) {
        return null;
    }

    if (props.useDiversion && props.isDiversionManagerOpen) {
        if (isLoadingDisruption) {
            return <div>Loading...</div>;
        }
        if (!fetchedDisruption) {
            return <div>Failed to load disruption data.</div>;
        }
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

    return (
        <div className={ `edit-effect-panel ${!props.isEditEffectPanelOpen ? 'pointer-events-none' : ''}` }>
            { props.isEditEffectPanelOpen && (
                <Paper component={ Stack } direction="column" justifyContent="center" className="mui-paper">
                    <div className="edit-effect-panel-body">
                        <div className="label-with-icon">
                            <h2 className="pl-4 pr-4 pt-4">{ `Edit details of Effect ${disruption.incidentNo}` }</h2>
                            <div style={ { display: 'flex', alignItems: 'center', gap: '10px' } }>
                                {props.useDiversion && (
                                    <div style={ { position: 'relative' } } data-diversion-menu>
                                        <Button
                                            className="diversion-button-custom"
                                            onClick={ handleMenuClick }
                                            style={ {
                                                whiteSpace: 'nowrap',
                                                minWidth: '120px',
                                                fontWeight: 'bold',
                                                fontSize: '16.8px',
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, .1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#1976d2',
                                                borderColor: '#1976d2',
                                                color: 'black',
                                                transition: 'background-color 0.2s ease',
                                            } }
                                            onMouseEnter={ (e) => {
                                                e.currentTarget.style.backgroundColor = '#1565c0';
                                            } }
                                            onMouseLeave={ (e) => {
                                                e.currentTarget.style.backgroundColor = '#1976d2';
                                            } }
                                        >
                                            <span style={ { color: 'black' } }>
                                                Diversions(
                                                { diversionsCount }
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
                                                style={ {
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    backgroundColor: 'white',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                    zIndex: 1000,
                                                    minWidth: '200px',
                                                    marginTop: '4px',
                                                } }
                                            >
                                                <div
                                                    role="button"
                                                    tabIndex={ 0 }
                                                    style={ {
                                                        padding: '8px 16px',
                                                        cursor: isAddDiversionEnabled() ? 'pointer' : 'not-allowed',
                                                        backgroundColor: isAddDiversionEnabled() ? 'white' : '#f5f5f5',
                                                        color: isAddDiversionEnabled() ? '#333' : '#999',
                                                        borderBottom: '1px solid #eee',
                                                    } }
                                                    onClick={ isAddDiversionEnabled() ? handleAddDiversion : undefined }
                                                    onKeyDown={ (e) => {
                                                        if (e.key === 'Enter' && isAddDiversionEnabled()) {
                                                            handleAddDiversion();
                                                        }
                                                    } }
                                                    onMouseEnter={ (e) => {
                                                        if (isAddDiversionEnabled()) {
                                                            e.target.style.backgroundColor = '#f0f0f0';
                                                        }
                                                    } }
                                                    onMouseLeave={ (e) => {
                                                        if (isAddDiversionEnabled()) {
                                                            e.target.style.backgroundColor = 'white';
                                                        }
                                                    } }
                                                >
                                                    Add Diversion
                                                </div>
                                                <div
                                                    role="button"
                                                    tabIndex={ 0 }
                                                    style={ {
                                                        padding: '8px 16px',
                                                        cursor: 'pointer',
                                                        backgroundColor: 'white',
                                                        color: '#333',
                                                    } }
                                                    onClick={ handleViewDiversions }
                                                    onKeyDown={ (e) => {
                                                        if (e.key === 'Enter') {
                                                            handleViewDiversions();
                                                        }
                                                    } }
                                                    onMouseEnter={ (e) => {
                                                        e.target.style.backgroundColor = '#f0f0f0';
                                                    } }
                                                    onMouseLeave={ (e) => {
                                                        e.target.style.backgroundColor = 'white';
                                                    } }
                                                >
                                                    View & Edit Diversions
                                                </div>
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
                                        <span className="font-size-md font-weight-bold">{LABEL_HEADER}</span>
                                    </Label>
                                    <Input
                                        id="disruption-creation__wizard-select-details__header"
                                        className="w-100 border border-dark"
                                        placeholder="Title of the message"
                                        maxLength={ HEADER_MAX_LENGTH }
                                        onChange={ event => updateDisruption({ header: event.target.value }) }
                                        onBlur={ onBlurTitle }
                                        value={ disruption.header }
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
                                        value={ disruption.impact }
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
                                    <div className={ `${isResolved() ? 'background-color-for-disabled-fields' : ''}` }>
                                        <Flatpickr
                                            data-testid="start-date_date-picker"
                                            key="start-date"
                                            id="disruption-creation__wizard-select-details__start-date"
                                            className={ `font-weight-normal cc-form-control form-control ${isStartDateDirty ? 'is-invalid' : ''}` }
                                            value={ disruption.startDate }
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
                                            data-testid="end-date_date-picker"
                                            key="end-date"
                                            id="disruption-creation__wizard-select-details__end-date"
                                            className={ `font-weight-normal cc-form-control form-control ${isEndDateDirty ? 'is-invalid' : ''}` }
                                            value={ disruption.endDate }
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
                                        data-testid="start-time_input"
                                        id="disruption-creation__wizard-select-details__start-time"
                                        className="border border-dark"
                                        value={ disruption.startTime }
                                        onChange={ (event) => {
                                            updateDisruption({ startTime: event.target.value });
                                            setIsStartTimeDirty(true);
                                        } }
                                        invalid={ (disruption.status === STATUSES.DRAFT ? (isStartTimeDirty && !startTimeValid()) : !startTimeValid()) }
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
                                            data-testid="end-time_input"
                                            id="disruption-creation__wizard-select-details__end-time"
                                            className="border border-dark"
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
                                        <Button disabled={ isViewAllDisabled() }
                                            className="showActivePeriods btn btn-secondary lh-1"
                                            onClick={ () => displayActivePeriods() }>
                                            View All
                                        </Button>
                                    </div>
                                    { (disruption.status === STATUSES.DRAFT
                                        ? (!isEmpty(disruption.recurrencePattern.byweekday) && activePeriodsValidV2())
                                        : !isEmpty(disruption.recurrencePattern.byweekday)) && (
                                        <div className="col-12 mb-3">
                                            <BsArrowRepeat size={ 22 } />
                                            <span className="pl-1">{ getRecurrenceText(parseRecurrencePattern(disruption.recurrencePattern)) }</span>
                                        </div>
                                    )}
                                    { (disruption.status === STATUSES.DRAFT
                                        ? (disruption.isRecurrencePatternDirty && (isEmpty(disruption.recurrencePattern.byweekday) || !activePeriodsValidV2()))
                                        : (isRecurrencePatternDirty && isEmpty(disruption.recurrencePattern.byweekday))) && (
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
                    <footer className="row m-0 justify-content-end p-4 position-fixed incident-footer-min-height">
                        <div className="col-4">
                            <Button
                                className="btn cc-btn-primary btn-block save-workaround"
                                onClick={ () => setDisruptionsDetailsModalOpen(true) }>
                                Preview & Share
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button
                                disabled={ isApplyDisabled }
                                className="btn cc-btn-primary btn-block save-workaround"
                                onClick={ () => shareToEmailHandler() }>
                                Share to email
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button
                                disabled={ isApplyDisabled }
                                className="btn cc-btn-primary btn-block save-workaround"
                                onClick={ () => onSubmit() }>
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
                    onEditDiversion={ () => {
                        // Edit diversion handler
                    } }
                    isOpen={ isViewDiversionsModalOpen }
                    setShouldRefetchDiversions={ setShouldRefetchDiversions }
                    diversions={ localDiversions }
                />
            )}
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
    isDiversionManagerOpen: PropTypes.bool,
    updateDataLoading: PropTypes.func.isRequired,
    isDataLoading: PropTypes.bool,
};

EditEffectPanel.defaultProps = {
    isEditEffectPanelOpen: false,
    disruptionIncidentNoToEdit: '',
    isWorkaroundPanelOpen: false,
    workaroundsToSync: [],
    isCancellationEffectOpen: false,
    useDisruptionNotePopup: false,
    useDiversion: false,
    isDiversionManagerOpen: false,
    isDataLoading: false,
};

export default connect(state => ({
    isEditEffectPanelOpen: isEditEffectPanelOpen(state),
    disruptionIncidentNoToEdit: getDisruptionKeyToEditEffect(state),
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
    isNotesRequiresToUpdate: isRequiresToUpdateNotes(state),
    isWorkaroundsRequiresToUpdate: isWorkaroundsNeedsToBeUpdated(state),
    isEditEffectUpdateRequested: isEditEffectUpdateRequested(state),
    newDisruptionKey: getRequestedDisruptionKeyToUpdateEditEffect(state),
    isCancellationEffectOpen: isCancellationEffectModalOpen(state),
    useDisruptionNotePopup: useDisruptionNotePopup(state),
    useDiversion: useDiversion(state),
    state,
    isDiversionManagerOpen: getIsDiversionManagerOpen(state),
    isDataLoading: isDataLoading(state),
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
    updateDataLoading,
})(EditEffectPanel);
