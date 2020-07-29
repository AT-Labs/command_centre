import { map } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { STATUSES, CAUSES, IMPACTS, DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../types/disruptions-types';
import {
    DATE_FORMAT,
    LABEL_AFFECTED_ROUTES,
    LABEL_CAUSE, LABEL_CREATED_BY,
    LABEL_CUSTOMER_IMPACT, LABEL_DESCRIPTION, LABEL_END_DATE, LABEL_END_TIME, LABEL_HEADER, LABEL_LAST_UPDATED_BY,
    LABEL_MODE, LABEL_START_DATE, LABEL_START_TIME, LABEL_STATUS, LABEL_URL,
    TIME_FORMAT,
} from '../../../../constants/disruptions';

import { formatCreatedUpdatedTime } from '../../../../utils/control/disruptions';
import DetailLoader from '../../../Common/Loader/DetailLoader';
import { DisruptionDetailSelect } from './DisruptionDetailSelect';
import DisruptionLabelAndText from './DisruptionLabelAndText';

const Resolved = (props) => {
    const { disruption, updateDisruption, isRequesting, resultDisruptionId } = props;

    const [status, setStatus] = useState(disruption.status);
    const [endTime, setEndTime] = useState(disruption.endTime);

    const handleUpdateDisruption = () => {
        const updatedDisruption = {
            ...disruption,
            status,
            endTime,
        };

        updateDisruption(updatedDisruption);
    };

    const setDisruptionStatus = (selectedStatus) => {
        setStatus(selectedStatus);
        if (disruption.status === STATUSES.RESOLVED && selectedStatus === STATUSES.IN_PROGRESS) {
            setEndTime(null);
        }
    };

    const isUpdating = isRequesting && resultDisruptionId === disruption.disruptionId;

    return (
        <Form>
            <div className="row">
                <section className="col-3">
                    <DisruptionLabelAndText
                        label={ LABEL_AFFECTED_ROUTES }
                        id="disruption-detail__effected-routes"
                        text={ map(disruption.affectedRoutes, 'routeShortName').join(', ') } />
                    <DisruptionLabelAndText label={ LABEL_MODE } id="disruption-detail__mode" text={ disruption.mode } />
                </section>
                <section className="col-3">
                    <DisruptionLabelAndText
                        label={ LABEL_CAUSE }
                        id="disruption-detail__cause"
                        text={ (CAUSES.find(cause => cause.value === disruption.cause) || DEFAULT_CAUSE).label } />
                    <DisruptionLabelAndText
                        label={ LABEL_CUSTOMER_IMPACT }
                        id="disruption-detail__impact"
                        text={ (IMPACTS.find(impact => impact.value === disruption.impact) || DEFAULT_IMPACT).label } />
                </section>
                <section className="col-3 row">
                    <DisruptionLabelAndText
                        className="mt-2 col-6"
                        label={ LABEL_START_DATE }
                        id="disruption-detail__start-date"
                        text={ moment(disruption.startTime).format(DATE_FORMAT) } />
                    <DisruptionLabelAndText
                        className="mt-2 col-6"
                        label={ LABEL_START_TIME }
                        id="disruption-detail__start-time"
                        text={ moment(disruption.startTime).format(TIME_FORMAT) } />
                    <DisruptionLabelAndText
                        className="col-6"
                        label={ LABEL_END_DATE }
                        id="disruption-detail__end-date"
                        text={ disruption.endTime ? moment(disruption.endTime).format(DATE_FORMAT) : '' } />
                    <DisruptionLabelAndText
                        className="col-6"
                        label={ LABEL_END_TIME }
                        id="disruption-detail__end-time"
                        text={ disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : '' } />
                </section>
                <section className="col-3">
                    <DisruptionDetailSelect id="disruption-detail__status"
                        value={ status }
                        options={ disruption.status === STATUSES.NOT_STARTED ? Object.values(STATUSES) : Object.values(STATUSES).filter(s => s !== STATUSES.NOT_STARTED) }
                        label={ LABEL_STATUS }
                        onChange={ setDisruptionStatus } />
                </section>
            </div>
            <div className="row align-items-end">
                <div className="col-8">
                    <FormGroup>
                        <Label for="disruption-detail__header">
                            <span className="font-size-md font-weight-bold">{LABEL_HEADER}</span>
                        </Label>
                        <Input id="disruption-detail__header"
                            defaultValue={ disruption.header }
                            disabled />
                    </FormGroup>
                    <FormGroup>
                        <Label for="disruption-detail__description">
                            <span className="font-size-md font-weight-bold">{LABEL_DESCRIPTION}</span>
                        </Label>
                        <Input id="disruption-detail__description"
                            className="textarea-no-resize"
                            type="textarea"
                            value={ disruption.description }
                            rows={ 5 }
                            disabled />
                    </FormGroup>
                    <FormGroup>
                        <Label for="disruption-detail__url">
                            <span className="font-size-md font-weight-bold">{LABEL_URL}</span>
                        </Label>
                        <Input id="disruption-detail__url"
                            defaultValue={ disruption.url }
                            disabled />
                    </FormGroup>
                </div>
                <div className="col-4">
                    <DisruptionLabelAndText id="disruption-detail__created-by" label={ LABEL_CREATED_BY } text={ `${disruption.createdBy}, ${formatCreatedUpdatedTime(disruption.createdTime)}` } />
                    <DisruptionLabelAndText id="disruption-detail__last-updated" label={ LABEL_LAST_UPDATED_BY } text={ `${disruption.lastUpdatedBy}, ${formatCreatedUpdatedTime(disruption.lastUpdatedTime)}` } />
                    <FormGroup className="pl-0 d-flex align-items-center">
                        <Button className="cc-btn-primary mr-3" onClick={ handleUpdateDisruption } disabled={ isUpdating }>Save Update</Button>
                        {isUpdating && <DetailLoader />}
                    </FormGroup>
                </div>
            </div>
        </Form>
    );
};

Resolved.propTypes = {
    disruption: PropTypes.object.isRequired,
    updateDisruption: PropTypes.func.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    resultDisruptionId: PropTypes.number,
};

Resolved.defaultProps = {
    resultDisruptionId: null,
};

export default Resolved;
