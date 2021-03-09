import { map } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import { CAUSES, IMPACTS } from '../../../../types/disruptions-types';
import {
    DATE_FORMAT,
    LABEL_AFFECTED_ROUTES,
    LABEL_CAUSE, LABEL_CREATED_BY,
    LABEL_CUSTOMER_IMPACT, LABEL_DESCRIPTION, LABEL_END_DATE, LABEL_END_TIME, LABEL_HEADER, LABEL_LAST_UPDATED_BY,
    LABEL_MODE, LABEL_START_DATE, LABEL_START_TIME, LABEL_STATUS, LABEL_URL,
    TIME_FORMAT,
} from '../../../../constants/disruptions';
import { formatCreatedUpdatedTime } from '../../../../utils/control/disruptions';
import DisruptionLabelAndText from './DisruptionLabelAndText';

const Readonly = (props) => {
    const { disruption } = props;

    return (
        <Form>
            <div className="row">
                <section className="col-3">
                    <DisruptionLabelAndText
                        label={ LABEL_AFFECTED_ROUTES }
                        id="disruption-detail__affected-entities"
                        text={ map(disruption.affectedRoutes, 'routeShortName').join(', ') } />
                    <DisruptionLabelAndText label={ LABEL_MODE } id="disruption-detail__mode" text={ disruption.mode } />
                </section>
                <section className="col-3">
                    <DisruptionLabelAndText label={ LABEL_CAUSE } id="disruption-detail__cause" text={ CAUSES.find(cause => cause.value === disruption.cause).label } />
                    <DisruptionLabelAndText
                        label={ LABEL_CUSTOMER_IMPACT }
                        id="disruption-detail__impact"
                        text={ IMPACTS.find(impact => impact.value === disruption.impact).label } />
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
                    <DisruptionLabelAndText label={ LABEL_STATUS } id="disruption-detail__status" text={ disruption.status } />
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
                </div>
            </div>
        </Form>
    );
};

Readonly.propTypes = {
    disruption: PropTypes.object.isRequired,
};

export default Readonly;
