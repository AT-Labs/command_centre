import { Table, Button } from 'reactstrap';
import { uniqueId, find, isEmpty } from 'lodash-es';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
    LABEL_AFFECTED_ROUTES,
    LABEL_CAUSE, LABEL_CREATED_AT, LABEL_CUSTOMER_IMPACT, LABEL_DESCRIPTION, LABEL_END_DATE, LABEL_END_TIME,
    LABEL_HEADER, LABEL_LAST_UPDATED_AT, LABEL_LAST_UPDATED_BY,
    LABEL_MODE, LABEL_START_DATE, LABEL_START_TIME,
    LABEL_STATUS, LABEL_URL, LABEL_CREATED_BY, LABEL_AFFECTED_STOPS, LABEL_WORKAROUNDS, LABEL_DISRUPTION_NOTES,
    LABEL_SEVERITY,
} from '../../../../../constants/disruptions';
import { DISRUPTIONS_MESSAGE_TYPE, SEVERITIES, STATUSES } from '../../../../../types/disruptions-types';
import { formatCreatedUpdatedTime, momentFromDateTime } from '../../../../../utils/control/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import { getWorkaroundsAsText } from '../../../../../utils/control/disruption-workarounds';
import { shareToEmail } from '../../../../../utils/control/disruption-sharing';
import CustomCollapse from '../../../../Common/CustomCollapse/CustomCollapse';
import { useDisruptionEmailFormat, useDraftDisruptions, useDisruptionDraftEmailSharing } from '../../../../../redux/selectors/appSettings';
import { useAlertCauses, useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';

const generateDisruptionNotes = (notes) => {
    if (Array.isArray(notes) && notes.length > 0) {
        return (
            <Table className="table">
                <tbody className="notes-tbody">
                    {[...notes].reverse().map(note => (
                        <tr key={ note.id } className="row d-block">
                            <td className="col-3">{formatCreatedUpdatedTime(note.createdTime)}</td>
                            <td className="col-3">{note.createdBy}</td>
                            <td className="col-6">{note.description}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        );
    }
    return <span>{ DISRUPTIONS_MESSAGE_TYPE.noNotesMessage }</span>;
};

const createLine = (label, value) => {
    if (!value) return null;

    return (
        <tr className="row" key={ uniqueId() }>
            <td className="col-4">{label}</td>
            <td className="col text-break">
                {label === LABEL_WORKAROUNDS && value.length === 0 ? DISRUPTIONS_MESSAGE_TYPE.noWorkaroundsMessage : null}
                {label === LABEL_WORKAROUNDS ? (
                    <CustomCollapse height="tiny" className="bg-white">
                        {getWorkaroundsAsText(value, '; \n')}
                    </CustomCollapse>
                ) : null}
                {label === LABEL_DISRUPTION_NOTES ? generateDisruptionNotes(value) : null}
                {(label !== LABEL_DISRUPTION_NOTES && label !== LABEL_WORKAROUNDS) ? value : null}
            </td>
        </tr>
    );
};

const DisruptionSummaryModal = (props) => {
    const causes = useAlertCauses();
    const impacts = useAlertEffects();

    const shareToEmailHandler = () => {
        const startTimeMoment = momentFromDateTime(props.disruption.startDate, props.disruption.startTime);
        let endTimeMoment;
        if (!isEmpty(props.disruption.endDate) && !isEmpty(props.disruption.endTime)) {
            endTimeMoment = momentFromDateTime(props.disruption.endDate, props.disruption.endTime);
        }
        const mergedEntities = [
            ...(props.disruption.affectedEntities.affectedStops || []),
            ...(props.disruption.affectedEntities.affectedRoutes || []),
        ];
        const disruptionToShare = {
            ...props.disruption,
            endTime: endTimeMoment,
            startTime: startTimeMoment,
            affectedEntities: mergedEntities,
        };
        shareToEmail(disruptionToShare);
    };
    const generateModalFooter = () => (
        <>
            {(
                props.useDisruptionDraftEmailSharing
    || !(props.useDraftDisruptions && props.disruption.status === STATUSES.DRAFT)
            ) && (
                <Button
                    onClick={ () => shareToEmailHandler() }
                    className="cc-btn-primary"
                >
                    Share to email
                </Button>
            )}
            <Button onClick={ () => props.onClose() } className="cc-btn-primary">
                Close
            </Button>
        </>
    );
    return (
        <CustomModal
            className="cc-modal-standard-width disruption-summary"
            title={ `Summary for Disruption #${props.disruption.incidentNo}` }
            isModalOpen={ props.isModalOpen }
            onClose={ () => props.onClose() }
            customFooter={ generateModalFooter() }
        >
            <Table className="table-layout-fixed">
                <tbody>
                    {createLine(LABEL_HEADER, props.disruption.header)}
                    {createLine(LABEL_SEVERITY, find(SEVERITIES, { value: props.disruption.severity }).label)}
                    {createLine(LABEL_STATUS, props.disruption.status)}
                    {createLine(LABEL_MODE, props.disruption.mode)}
                    {createLine(LABEL_AFFECTED_ROUTES, [...new Set(props.disruption.affectedEntities.affectedRoutes.map(({ routeShortName }) => routeShortName))].join(', '))}
                    {createLine(LABEL_AFFECTED_STOPS, [...new Set(props.disruption.affectedEntities.affectedStops.map(({ stopCode }) => stopCode))].join(', '))}
                    {createLine(LABEL_CUSTOMER_IMPACT, ((find(impacts, { value: props.disruption.impact })) || DEFAULT_IMPACT).label)}
                    {createLine(LABEL_CAUSE, ((find(causes, { value: props.disruption.cause })) || DEFAULT_CAUSE).label)}
                    {props.disruption.description ? createLine(LABEL_DESCRIPTION, props.disruption.description) : null}
                    {createLine(LABEL_START_DATE, props.disruption.startDate)}
                    {createLine(LABEL_START_TIME, props.disruption.startTime)}
                    {createLine(LABEL_END_DATE, props.disruption.endDate)}
                    {createLine(LABEL_END_TIME, props.disruption.endTime)}
                    {createLine(LABEL_URL, props.disruption.url)}
                    {createLine(LABEL_CREATED_AT, formatCreatedUpdatedTime(props.disruption.createdTime))}
                    {createLine(LABEL_CREATED_BY, props.disruption.createdBy)}
                    {createLine(LABEL_LAST_UPDATED_AT, formatCreatedUpdatedTime(props.disruption.lastUpdatedTime))}
                    {createLine(LABEL_LAST_UPDATED_BY, props.disruption.lastUpdatedBy)}
                    {createLine(LABEL_DISRUPTION_NOTES, props.disruption.notes)}
                    {createLine(LABEL_WORKAROUNDS, props.disruption.workarounds)}
                </tbody>
            </Table>
        </CustomModal>
    );
};

DisruptionSummaryModal.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    disruption: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    useDraftDisruptions: PropTypes.bool.isRequired,
    useDisruptionDraftEmailSharing: PropTypes.bool.isRequired,
};

export default connect(state => ({
    useDisruptionEmailFormat: useDisruptionEmailFormat(state),
    useDraftDisruptions: useDraftDisruptions(state),
    useDisruptionDraftEmailSharing: useDisruptionDraftEmailSharing(state),
}), {})(DisruptionSummaryModal);
