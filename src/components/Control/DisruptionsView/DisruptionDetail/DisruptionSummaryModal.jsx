import { Table } from 'reactstrap';
import _ from 'lodash-es';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
    DATE_FORMAT,
    LABEL_AFFECTED_ROUTES,
    LABEL_CAUSE, LABEL_CREATED_AT, LABEL_CUSTOMER_IMPACT, LABEL_DESCRIPTION, LABEL_END_DATE, LABEL_END_TIME,
    LABEL_HEADER, LABEL_LAST_UPDATED_AT,
    LABEL_MODE, LABEL_START_DATE, LABEL_START_TIME,
    LABEL_STATUS, LABEL_URL, TIME_FORMAT, LABEL_CREATED_BY, LABEL_LAST_UPDATED_BY,
} from '../../../../constants/disruptions';
import { CAUSES, IMPACTS } from '../../../../types/disruptions-types';
import { formatCreatedUpdatedTime } from '../../../../utils/control/disruptions';
import CustomModal from '../../../Common/CustomModal/CustomModal';


const createLine = (label, value) => (value && (
    <tr>
        <td>{label}</td>
        <td>{value}</td>
    </tr>
));

const DisruptionSummaryModal = (props) => {
    const endDateTimeMoment = moment(props.disruption.endTime);
    return (
        <CustomModal
            className="cc-modal-standard-width disruption-summary"
            title={ `Summary for Disruption #${props.disruption.incidentNo}` }
            isModalOpen={ props.isModalOpen }
            onClose={ () => props.onClose() }
            okButton={ {
                onClick: () => props.onClose(),
                label: 'Close',
            } }>
            <Table>
                <tbody>
                    {createLine(LABEL_HEADER, props.disruption.header)}
                    {createLine(LABEL_STATUS, props.disruption.status)}
                    {createLine(LABEL_MODE, props.disruption.mode)}
                    {createLine(LABEL_AFFECTED_ROUTES, props.disruption.affectedRoutes.map(route => route.routeShortName).join(', '))}
                    {createLine(LABEL_CAUSE, _.find(IMPACTS, { value: props.disruption.impact }).label)}
                    {createLine(LABEL_CUSTOMER_IMPACT, _.find(CAUSES, { value: props.disruption.cause }).label)}
                    {createLine(LABEL_DESCRIPTION, props.disruption.description)}
                    {createLine(LABEL_START_DATE, moment(props.disruption.startTime).format(DATE_FORMAT))}
                    {createLine(LABEL_START_TIME, moment(props.disruption.startTime).format(TIME_FORMAT))}
                    {createLine(LABEL_END_DATE, endDateTimeMoment.isValid() ? endDateTimeMoment.format(DATE_FORMAT) : null)}
                    {createLine(LABEL_END_TIME, endDateTimeMoment.isValid() ? endDateTimeMoment.format(TIME_FORMAT) : null)}
                    {createLine(LABEL_URL, props.disruption.url)}
                    {createLine(LABEL_CREATED_AT, formatCreatedUpdatedTime(props.disruption.createdTime))}
                    {createLine(LABEL_CREATED_BY, props.disruption.createdBy)}
                    {createLine(LABEL_LAST_UPDATED_AT, formatCreatedUpdatedTime(props.disruption.lastUpdatedTime))}
                    {createLine(LABEL_LAST_UPDATED_BY, props.disruption.lastUpdatedBy)}
                </tbody>
            </Table>
        </CustomModal>
    );
};

DisruptionSummaryModal.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    disruption: PropTypes.object.isRequired,
    okButton: PropTypes.shape({
        label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
        onClick: PropTypes.func.isRequired,
        isDisabled: PropTypes.bool,
        className: PropTypes.string,
    }).isRequired,
    onClose: PropTypes.func,
};

DisruptionSummaryModal.defaultProps = {
    onClose: null,
};

export default DisruptionSummaryModal;
