import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { toString, omit, isEmpty, uniqBy, uniqWith } from 'lodash-es';
import moment from 'moment';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import HistoryIcon from '@mui/icons-material/History';
import Message from '../../Common/Message/Message';
import { SEVERITIES, STATUSES } from '../../../../types/disruptions-types';
import { useAlertCauses, useAlertEffects } from '../../../../utils/control/alert-cause-effect';
import { useDisruptionNotePopup, useDraftDisruptions, useParentChildIncident, useEditDisruptionNotes } from '../../../../redux/selectors/appSettings';
import {
    LABEL_CAUSE,
    LABEL_CREATED_BY,
    LABEL_CUSTOMER_IMPACT,
    LABEL_LAST_UPDATED_BY,
    LABEL_MODE,
    LABEL_DISRUPTION_NOTES,
    DESCRIPTION_NOTE_MAX_LENGTH,
    LABEL_LAST_NOTE,
    LABEL_SEVERITY,
    DATE_FORMAT,
    TIME_FORMAT,
} from '../../../../constants/disruptions';
import {
    getRoutesByShortName,
    openCreateDisruption,
    openCopyDisruption,
    updateAffectedRoutesState,
    updateAffectedStopsState,
    updateEditMode,
    updateDisruptionToEdit,
    uploadDisruptionFiles,
    deleteDisruptionFile,
    updateDisruption,
    clearDisruptionActionResult,
} from '../../../../redux/actions/control/disruptions';
import {
    getShapes, getDisruptionsLoadingState,
    getRouteColors, getAffectedRoutes, getAffectedStops, getBoundsToFit, getDisruptionAction,
} from '../../../../redux/selectors/control/disruptions';
import DetailLoader from '../../../Common/Loader/DetailLoader';
import { DisruptionDetailSelect } from '../DisruptionDetail/DisruptionDetailSelect';
import DisruptionLabelAndText from '../DisruptionDetail/DisruptionLabelAndText';
import {
    formatCreatedUpdatedTime,
    recurrenceRadioOptions,
    momentFromDateTime,
} from '../../../../utils/control/disruptions';
import DisruptionSummaryModal from '../DisruptionDetail/DisruptionSummaryModal';
import RadioButtons from '../../../Common/RadioButtons/RadioButtons';
import EDIT_TYPE from '../../../../types/edit-types';
import ConfirmationModal from '../../Common/ConfirmationModal/ConfirmationModal';
import { confirmationModalTypes } from '../types';
import { LastNoteView } from '../DisruptionDetail/LastNoteView';
import { fetchEndDateFromRecurrence } from '../../../../utils/recurrence';

import '../DisruptionDetail/styles.scss';
import '../../IncidentsView/style.scss';
import AddNoteModal from '../../IncidentsView/IncidentCreation/EditIncidentDetails/AddNoteModal';
import HistoryNotesModal from '../../IncidentsView/IncidentCreation/EditIncidentDetails/HistoryNotesModal';

export const MinimizeDisruptionDetail = (props) => {
    const { disruption, isRequesting, resultDisruptionId, resultStatus, resultMessage } = props;
    const { NONE, COPY } = confirmationModalTypes;
    const {
        affectedEntities, incidentNo, cause, impact, disruptionId,
        lastUpdatedTime, recurrent, mode, severity, lastUpdatedBy, createdTime, createdBy,
    } = disruption;
    const formatEndDateFromEndTime = disruption.endTime ? moment(disruption.endTime).format(DATE_FORMAT) : '';
    const fetchEndDate = () => (disruption.recurrent ? fetchEndDateFromRecurrence(disruption.recurrencePattern) : formatEndDateFromEndTime);
    const fetchStartDate = () => (disruption.startTime ? moment(disruption.startTime).format(DATE_FORMAT) : '');

    const causes = useAlertCauses();
    const impacts = useAlertEffects();

    const [disruptionsDetailsModalOpen, setDisruptionsDetailsModalOpen] = useState(false);
    const [notes, setNotes] = useState(disruption.notes);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(NONE);
    const [descriptionNote, setDescriptionNote] = useState('');
    const [lastNote, setLastNote] = useState();
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [historyNotesModalOpen, setHistoryNotesModalOpen] = useState(false);

    const haveRoutesOrStopsChanged = (affectedRoutes, affectedStops) => {
        const uniqRoutes = uniqWith([...affectedRoutes, ...props.routes], (routeA, routeB) => routeA.routeId === routeB.routeId && routeA.stopCode === routeB.stopCode);
        const uniqStops = uniqWith([...affectedStops, ...props.stops], (stopA, stopB) => stopA.stopCode === stopB.stopCode && stopA.routeId === stopB.routeId);

        return uniqRoutes.length !== affectedRoutes.length || uniqStops.length !== affectedStops.length
            || uniqRoutes.length !== props.routes.length || uniqStops.length !== props.stops.length;
    };

    const incidentClassName = props.useParentChildIncident ? 'incident-creation__wizard-select-details__select' : '';

    const affectedEntitiesWithoutShape = toString(affectedEntities.map(entity => omit(entity, ['shapeWkt'])));
    useEffect(() => {
        const affectedStops = affectedEntities.filter(entity => entity.type === 'stop');
        const affectedRoutes = affectedEntities.filter(entity => entity.type === 'route' || (entity.routeId && isEmpty(entity.stopCode)));

        if ((isEmpty(props.stops) && isEmpty(props.routes)) || haveRoutesOrStopsChanged(affectedRoutes, affectedStops)) {
            props.updateAffectedStopsState(affectedStops);
            props.updateAffectedRoutesState(affectedRoutes);

            const routesToGet = uniqBy([...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)], item => item.routeId);

            if (routesToGet.length) {
                props.getRoutesByShortName(routesToGet.slice(0, 10));
            }
        }
    }, [affectedEntitiesWithoutShape, affectedEntities]);

    useEffect(() => {
        setNotes(disruption.notes);
        setLastNote();
    }, [lastUpdatedTime]);

    const setDisruption = () => ({
        ...disruption,
        startTime: momentFromDateTime(fetchStartDate(), disruption.startTime ? moment(disruption.startTime).format(TIME_FORMAT) : ''),
        endTime: momentFromDateTime(fetchEndDate(), disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : ''),
        notes: [...notes, { description: descriptionNote }],
    });

    const handleAddNoteModalSubmit = (note) => {
        setDescriptionNote(note);
        props.updateDisruption({
            ...disruption,
            notes: [...notes, { description: note }],
        });
        setNoteModalOpen(false);
    };

    const handleAddNoteModalClose = (note) => {
        setDescriptionNote(note);
        setNoteModalOpen(false);
    };

    useEffect(() => {
        setDescriptionNote('');
        const { notes: disruptionNotes } = disruption;
        if (disruptionNotes.length > 0) {
            setLastNote(disruptionNotes[disruptionNotes.length - 1]);
        }
    }, [lastUpdatedTime, lastNote]);

    const onNoteUpdate = async (updatedDisruption) => {
        const updatedNotes = updatedDisruption.notes || disruption.notes || [];
        const formattedNotes = Array.isArray(updatedNotes)
            ? updatedNotes
                .filter(note => note?.description)
                .map(note => ({
                    ...(note.id && { id: note.id }),
                    description: note.description,
                }))
            : [];

        const disruptionToUpdate = {
            ...disruption,
            ...updatedDisruption,
            notes: formattedNotes,
            startTime: momentFromDateTime(fetchStartDate(), disruption.startTime ? moment(disruption.startTime).format(TIME_FORMAT) : ''),
            endTime: momentFromDateTime(fetchEndDate(), disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : ''),
        };
        await props.updateDisruption(disruptionToUpdate);
    };

    const handleUpdateDisruption = () => props.updateDisruption(setDisruption());

    const handleCopyDisruption = () => {
        props.openCopyDisruption(true, incidentNo);

        props.updateEditMode(EDIT_TYPE.COPY);
        props.updateDisruptionToEdit(setDisruption());
    };

    const causeAndImpactAreValid = causes.find(c => c.value === cause) && impacts.find(i => i.value === impact);

    const isUpdating = isRequesting && resultDisruptionId === disruptionId;

    const isSaveDisabled = (isUpdating || !causeAndImpactAreValid);

    const confirmationModalProps = {
        [NONE]: {
            title: 'title',
            message: 'message',
            isOpen: false,
            onClose: () => { setIsAlertModalOpen(NONE); },
            onAction: () => { setIsAlertModalOpen(NONE); },
        },
        [COPY]: {
            title: 'Copy disruption',
            message: 'By confirming this action this disruption will be set as a Stop-based disruption and all routes added previously will be lost.',
            isOpen: true,
            onClose: () => { setIsAlertModalOpen(NONE); },
            onAction: () => {
                setIsAlertModalOpen(NONE);
                props.updateAffectedRoutesState([]);
                handleCopyDisruption();
            },
        },
    };

    const activeConfirmationModalProps = confirmationModalProps[isAlertModalOpen];

    const onCopyHandler = () => {
        if (!isEmpty(props.stops) && !isEmpty(props.routes)) {
            setIsAlertModalOpen(COPY);
        } else {
            handleCopyDisruption();
        }
    };

    return (
        <Form className={ props.className }>
            {resultStatus && resultDisruptionId === disruption.disruptionId && (
                <Message
                    message={ {
                        id: `${disruptionId}`,
                        type: resultStatus,
                        body: resultMessage,
                    } }
                    onClose={ () => props.clearDisruptionActionResult() }
                />
            )}
            <div className="row mt-3">
                <section className="col-12">
                    <RadioButtons { ...recurrenceRadioOptions(recurrent) } />
                </section>
                <section className="col-6">
                    <div className="row">
                        <section className="col-12">
                            <div className="row">
                                <div className="col-6">
                                    <div className="mt-2 position-relative form-group">
                                        <DisruptionLabelAndText id="disruption-detail__mode" label={ LABEL_MODE } text={ mode } />
                                    </div>
                                    <div className={ `mt-2 position-relative form-group ${incidentClassName}` }>
                                        <DisruptionDetailSelect
                                            id="disruption-detail__cause"
                                            value={ cause }
                                            options={ causes }
                                            label={ LABEL_CAUSE }
                                            useParentChildIncident={ props.useParentChildIncident }
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className={ `col-6 ${incidentClassName}` }>
                                    <FormGroup className="mt-2">
                                        <DisruptionDetailSelect
                                            id="disruption-detail__severity"
                                            value={ severity }
                                            options={ SEVERITIES }
                                            label={ LABEL_SEVERITY }
                                            useParentChildIncident={ props.useParentChildIncident }
                                            disabled
                                        />
                                    </FormGroup>
                                    <DisruptionDetailSelect
                                        id="disruption-detail__impact"
                                        value={ impact }
                                        options={ impacts }
                                        label={ LABEL_CUSTOMER_IMPACT }
                                        useParentChildIncident={ props.useParentChildIncident }
                                        disabled
                                    />
                                </div>
                                { !causeAndImpactAreValid && (<div className="col-12 cc-text-orange">Cause and/or Effect selected for this disruption are no longer valid.</div>)}
                            </div>
                        </section>
                    </div>
                </section>
                <section className="col-6">
                    <FormGroup className="disruption-details__notes-group">
                        <Label for="disruption-detail__notes">
                            <span className="font-size-md font-weight-bold">
                                {LABEL_DISRUPTION_NOTES}
                                {' '}
                                <span className="text-muted font-size-sm font-weight-light">Optional. To view all notes, select `Show Summary`</span>
                            </span>
                        </Label>
                        <div className="disruption-detail__notes-input-container">
                            <Input
                                id="disruption-detail__notes"
                                className="textarea-no-resize border border-dark"
                                type="textarea"
                                value={ descriptionNote }
                                onChange={ e => setDescriptionNote(e.currentTarget.value) }
                                maxLength={ DESCRIPTION_NOTE_MAX_LENGTH }
                                rows={ 5 }
                            />
                            {props.useDisruptionNotePopup && (
                                <OpenInNewOutlinedIcon
                                    className="disruption-detail-expand-note-icon"
                                    onClick={ () => setNoteModalOpen(true) }
                                />
                            )}
                        </div>
                    </FormGroup>
                </section>
            </div>
            <div className="row">
                <div className="col-5 disruption-detail__contributors">
                    <div className="d-flex align-items-start">
                        <div style={ { flex: 1, minWidth: 0 } }>
                            <LastNoteView label={ LABEL_LAST_NOTE } note={ lastNote } id="disruption-detail__last-note-view" />
                            <DisruptionLabelAndText id="disruption-detail__created-by" label={ LABEL_CREATED_BY } text={ `${createdBy}, ${formatCreatedUpdatedTime(createdTime)}` } />
                            <DisruptionLabelAndText id="disruption-detail__last-updated" label={ LABEL_LAST_UPDATED_BY } text={ `${lastUpdatedBy}, ${formatCreatedUpdatedTime(lastUpdatedTime)}` } />
                        </div>
                        {props.useEditDisruptionNotes && lastNote && (
                            <HistoryIcon
                                style={ { color: '#399CDB', cursor: 'pointer', marginLeft: '8px', flexShrink: 0, marginTop: '4px' } }
                                onClick={ () => setHistoryNotesModalOpen(true) }
                                title="View Notes History"
                            />
                        )}
                    </div>
                </div>
                <div className="col-7">
                    <FormGroup className="pl-0 h-100 d-flex align-items-end justify-content-end">
                        { !props.useParentChildIncident && (
                            <Button
                                className="cc-btn-primary ml-1 mr-1 mb-2"
                                onClick={ onCopyHandler }
                                disabled={ isUpdating || isSaveDisabled }
                            >
                                Copy
                            </Button>
                        )}
                        <Button
                            className="control-messaging-view__stop-groups-btn cc-btn-primary ml-1 mb-2"
                            onClick={ () => setDisruptionsDetailsModalOpen(true) }>
                            {(props.useDraftDisruptions && disruption.status === STATUSES.DRAFT) ? 'Preview' : 'Preview & Share' }
                        </Button>
                        <Button
                            className="cc-btn-primary ml-1 mr-1 mb-2"
                            onClick={ handleUpdateDisruption }
                            disabled={ isSaveDisabled }>
                            Save Changes
                        </Button>
                        <DisruptionSummaryModal
                            disruption={ disruption }
                            isModalOpen={ disruptionsDetailsModalOpen }
                            onClose={ () => setDisruptionsDetailsModalOpen(false) } />
                        {isUpdating && <DetailLoader />}
                    </FormGroup>
                </div>
            </div>
            <AddNoteModal
                disruption={ { ...disruption, note: descriptionNote } }
                isModalOpen={ noteModalOpen }
                onClose={ note => handleAddNoteModalClose(note) }
                onSubmit={ note => handleAddNoteModalSubmit(note) }
            />
            {props.useEditDisruptionNotes && (
                <HistoryNotesModal
                    disruption={ disruption }
                    isModalOpen={ historyNotesModalOpen }
                    onClose={ () => setHistoryNotesModalOpen(false) }
                    onNoteUpdate={ onNoteUpdate } />
            )}
            <ConfirmationModal
                title={ activeConfirmationModalProps.title }
                message={ activeConfirmationModalProps.message }
                isOpen={ activeConfirmationModalProps.isOpen }
                onClose={ activeConfirmationModalProps.onClose }
                onAction={ activeConfirmationModalProps.onAction } />
        </Form>
    );
};

MinimizeDisruptionDetail.propTypes = {
    disruption: PropTypes.object.isRequired,
    updateDisruption: PropTypes.func.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    resultDisruptionId: PropTypes.number,
    getRoutesByShortName: PropTypes.func.isRequired,
    shapes: PropTypes.array,
    isLoading: PropTypes.bool,
    routeColors: PropTypes.array,
    openCreateDisruption: PropTypes.func.isRequired,
    openCopyDisruption: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    updateEditMode: PropTypes.func.isRequired,
    updateDisruptionToEdit: PropTypes.func.isRequired,
    uploadDisruptionFiles: PropTypes.func.isRequired,
    deleteDisruptionFile: PropTypes.func.isRequired,
    routes: PropTypes.array.isRequired,
    stops: PropTypes.array.isRequired,
    className: PropTypes.string,
    boundsToFit: PropTypes.array.isRequired,
    resultStatus: PropTypes.string,
    resultMessage: PropTypes.string,
    resultCreateNotification: PropTypes.bool,
    isCopied: PropTypes.bool,
    clearDisruptionActionResult: PropTypes.func.isRequired,
    useDraftDisruptions: PropTypes.bool,
    useParentChildIncident: PropTypes.bool,
    useDisruptionNotePopup: PropTypes.bool,
    useEditDisruptionNotes: PropTypes.bool,
};

MinimizeDisruptionDetail.defaultProps = {
    shapes: [],
    isLoading: false,
    resultDisruptionId: null,
    routeColors: [],
    className: '',
    isCopied: false,
    resultCreateNotification: false,
    resultMessage: '',
    resultStatus: '',
    useDraftDisruptions: false,
    useParentChildIncident: false,
    useDisruptionNotePopup: false,
};

export default connect(state => ({
    ...getDisruptionAction(state),
    shapes: getShapes(state),
    isLoading: getDisruptionsLoadingState(state),
    routeColors: getRouteColors(state),
    routes: getAffectedRoutes(state),
    stops: getAffectedStops(state),
    boundsToFit: getBoundsToFit(state),
    useDraftDisruptions: useDraftDisruptions(state),
    useParentChildIncident: useParentChildIncident(state),
    useDisruptionNotePopup: useDisruptionNotePopup(state),
    useEditDisruptionNotes: useEditDisruptionNotes(state),
}), {
    getRoutesByShortName,
    openCreateDisruption,
    openCopyDisruption,
    updateAffectedRoutesState,
    updateAffectedStopsState,
    updateEditMode,
    updateDisruptionToEdit,
    uploadDisruptionFiles,
    deleteDisruptionFile,
    updateDisruption,
    clearDisruptionActionResult,
})(MinimizeDisruptionDetail);
