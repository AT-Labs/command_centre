import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import _ from 'lodash-es';
import { MdModeEdit } from 'react-icons/md';
import Flatpickr from 'react-flatpickr';
import { CAUSES, IMPACTS, STATUSES } from '../../../../types/disruptions-types';
import {
    DATE_FORMAT,
    DESCRIPTION_MAX_LENGTH,
    HEADER_MAX_LENGTH,
    LABEL_AFFECTED_ROUTES,
    LABEL_CAUSE,
    LABEL_CREATED_BY,
    LABEL_CUSTOMER_IMPACT,
    LABEL_DESCRIPTION,
    LABEL_END_DATE,
    LABEL_END_TIME,
    LABEL_HEADER,
    LABEL_LAST_UPDATED_BY,
    LABEL_MODE,
    LABEL_START_DATE,
    LABEL_START_TIME,
    LABEL_STATUS,
    LABEL_URL,
    TIME_FORMAT,
    URL_MAX_LENGTH,
} from '../../../../constants/disruptions';
import DetailLoader from '../../../Common/Loader/DetailLoader';
import { DisruptionDetailSelect } from './DisruptionDetailSelect';
import DisruptionLabelAndText from './DisruptionLabelAndText';
import { isUrlValid } from '../../../../utils/helpers';
import {
    formatCreatedUpdatedTime,
    getDatePickerOptions,
    isEndDateValid,
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
    momentFromDateTime,
} from '../../../../utils/control/disruptions';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import SelectRoutesPicklist from '../SelectRoutesPicklist';
import VEHICLE_TYPES from '../../../../types/vehicle-types';
import './styles.scss';
import DisruptionSummaryModal from './DisruptionSummaryModal';

const InProgress = (props) => {
    const { disruption, updateDisruption, isRequesting, resultDisruptionId } = props;
    const [now] = useState(moment().second(0).millisecond(0));
    const [cause, setCause] = useState(disruption.cause);
    const [impact, setImpact] = useState(disruption.impact);
    const [status, setStatus] = useState(disruption.status);
    const [description, setDescription] = useState(disruption.description);
    const [header, setHeader] = useState(disruption.header);
    const [url, setUrl] = useState(disruption.url);
    const [affectedRoutes, setAffectedRoutes] = useState(disruption.affectedRoutes);
    const [mode, setMode] = useState(disruption.mode);
    const [routesModalOpen, setRoutesModalOpen] = useState(false);
    const [disruptionsDetailsModalOpen, setDisruptionsDetailsModalOpen] = useState(false);
    const [startTime, setStartTime] = useState(moment(disruption.startTime).format(TIME_FORMAT));
    const [startDate, setStartDate] = useState(moment(disruption.startTime).format(DATE_FORMAT));
    const [endTime, setEndTime] = useState(disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : '');
    const [endDate, setEndDate] = useState(disruption.endTime ? moment(disruption.endTime).format(DATE_FORMAT) : '');
    const [disruptionOpenedTime] = useState(moment().second(0).millisecond(0));


    const handleUpdateDisruption = () => {
        const updatedDisruption = {
            ...disruption,
            cause,
            impact,
            status,
            description,
            header,
            url,
            affectedRoutes,
            mode,
            startTime: momentFromDateTime(startDate, startTime),
            endTime: momentFromDateTime(endDate, endTime),
        };

        updateDisruption(updatedDisruption);
    };

    const setDisruptionStatus = (selectedStatus) => {
        setStatus(selectedStatus);
        if (disruption.status === STATUSES.NOT_STARTED && selectedStatus !== STATUSES.NOT_STARTED) {
            setStartDate(moment().format(DATE_FORMAT));
            setStartTime(moment().format(TIME_FORMAT));
        } else if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.NOT_STARTED) {
            setStartDate(moment(disruption.startTime).format(DATE_FORMAT));
            setStartTime(moment(disruption.startTime).format(TIME_FORMAT));
        } else if (disruption.status === STATUSES.IN_PROGRESS && selectedStatus === STATUSES.RESOLVED) {
            setEndDate(moment().format(DATE_FORMAT));
            setEndTime(moment().format(TIME_FORMAT));
        }
    };

    const isStartDateTimeDisabled = () => status !== STATUSES.NOT_STARTED;

    const isEndDateTimeDisabled = () => status === STATUSES.RESOLVED;

    const startTimeValid = () => {
        if (isStartDateTimeDisabled()) {
            return true;
        }
        return isStartTimeValid(startDate, startTime, disruptionOpenedTime);
    };

    const endTimeValid = () => {
        if (isEndDateTimeDisabled()) {
            return true;
        }
        return isEndTimeValid(endDate, endTime, now, startDate, startTime);
    };

    const endDateValid = () => {
        if (isEndDateTimeDisabled()) {
            return true;
        }
        return isEndDateValid(endDate, startDate);
    };

    const startDateValid = () => {
        if (isStartDateTimeDisabled()) {
            return true;
        }
        return isStartDateValid(startDate, disruptionOpenedTime);
    };

    const getOptionalLabel = label => <React.Fragment>{label} <small className="text-muted">optional</small></React.Fragment>;

    const isUpdating = isRequesting && resultDisruptionId === disruption.disruptionId;

    const isSaveDisabled = _.some([cause, impact, status, description, header], _.isEmpty)
        || !isUrlValid(url);

    const updateRoutesAndMode = (selectedItems) => {
        setAffectedRoutes(selectedItems.map(route => _.mapKeys(route, (value, key) => _.camelCase(key))));
        const modes = _.uniq(selectedItems.map(route => route.route_type)).map(routeType => VEHICLE_TYPES[routeType].type).join(', ');
        setMode(modes);
    };

    const onRouteModalClose = () => {
        setRoutesModalOpen(false);
        setAffectedRoutes(disruption.affectedRoutes);
        setMode(disruption.mode);
    };

    const datePickerOptionsStartDate = getDatePickerOptions(isStartDateTimeDisabled() ? undefined : 'today');
    const datePickerOptionsEndDate = getDatePickerOptions(isEndDateTimeDisabled() ? undefined : startDate);

    return (
        <Form>
            <div className="row">
                <section className="col-3">
                    <FormGroup className="mt-2">
                        <Label for="disruption-detail__effected-routes">
                            <span className="font-size-md font-weight-bold">{ LABEL_AFFECTED_ROUTES }</span>
                        </Label>
                        <Button
                            className="w-100 border border-dark d-flex align-items-center form-control disruption-detail__effected-routes__button"
                            onClick={ () => setRoutesModalOpen(true) }>
                            <MdModeEdit
                                className="disruption-detail__effected-routes__button-icon mr-2"
                                size={ 25 }
                                role="button" />
                            <span className="disruption-detail__effected-routes__button-span">{ _.map(affectedRoutes, 'routeShortName').join(', ') }</span>
                        </Button>
                        <CustomModal
                            className="cc-modal-standard-width"
                            title="Select Routes"
                            isModalOpen={ routesModalOpen }
                            onClose={ () => onRouteModalClose() }>
                            <SelectRoutesPicklist
                                data={ ({ affectedRoutes: affectedRoutes.map(route => _.mapKeys(route, (value, key) => _.snakeCase(key))) }) }
                                cancelButtonLabel="Cancel"
                                onClose={ () => onRouteModalClose() }
                                onDataUpdate={ selectedItems => updateRoutesAndMode(selectedItems) }
                                onSubmit={ () => setRoutesModalOpen(false) } />
                        </CustomModal>
                    </FormGroup>
                    <DisruptionLabelAndText id="disruption-detail__mode" label={ LABEL_MODE } text={ mode } />
                </section>
                <section className="col-3">
                    <DisruptionDetailSelect id="disruption-detail__cause" value={ cause } options={ CAUSES } label={ LABEL_CAUSE } onChange={ setCause } />
                    <DisruptionDetailSelect id="disruption-detail__impact" value={ impact } options={ IMPACTS } label={ LABEL_CUSTOMER_IMPACT } onChange={ setImpact } />
                </section>
                <section className="col-3 row">
                    <FormGroup className="mt-2 col-6">
                        <Label for="disruption-detail__start-date">
                            <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                        </Label>
                        <Flatpickr
                            id="disruption-detail__start-date"
                            className="font-weight-normal cc-form-control form-control"
                            value={ startDate }
                            disabled={ isStartDateTimeDisabled() }
                            options={ datePickerOptionsStartDate }
                            placeholder="Select date"
                            onChange={ date => setStartDate(moment(date[0]).format(DATE_FORMAT)) } />
                    </FormGroup>
                    <FormGroup className="mt-2 col-6">
                        <Label for="disruption-detail__start-time">
                            <span className="font-size-md font-weight-bold">{LABEL_START_TIME}</span>
                        </Label>
                        <Input
                            id="disruption-detail__start-time"
                            className="border border-dark"
                            value={ startTime }
                            disabled={ isStartDateTimeDisabled() }
                            onChange={ event => setStartTime(event.target.value) }
                            invalid={ !startTimeValid() }
                        />
                    </FormGroup>
                    <FormGroup className="col-6">
                        <Label for="disruption-detail__end-date">
                            <span className="font-size-md font-weight-bold">{LABEL_END_DATE}</span>
                        </Label>
                        <Flatpickr
                            id="disruption-detail__end-date"
                            className="font-weight-normal cc-form-control form-control"
                            value={ endDate }
                            disabled={ isEndDateTimeDisabled() }
                            options={ datePickerOptionsEndDate }
                            onChange={ (date) => {
                                setEndDate(date.length ? moment(date[0]).format(DATE_FORMAT) : '');
                                if (date.length === 0) {
                                    setEndTime('');
                                }
                            } } />
                    </FormGroup>
                    <FormGroup className="col-6">
                        <Label for="disruption-detail__end-time">
                            <span className="font-size-md font-weight-bold">{LABEL_END_TIME}</span>
                        </Label>
                        <Input
                            id="disruption-detail__end-time"
                            className="border border-dark"
                            value={ endTime }
                            disabled={ isEndDateTimeDisabled() }
                            onChange={ event => setEndTime(event.target.value) }
                            invalid={ !endTimeValid() }
                        />
                    </FormGroup>
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
                            className="border border-dark"
                            defaultValue={ header }
                            onChange={ e => setHeader(e.currentTarget.value) }
                            maxLength={ HEADER_MAX_LENGTH } />
                    </FormGroup>
                    <FormGroup>
                        <Label for="disruption-detail__description">
                            <span className="font-size-md font-weight-bold">{LABEL_DESCRIPTION}</span>
                        </Label>
                        <Input id="disruption-detail__description"
                            className="textarea-no-resize border border-dark"
                            type="textarea"
                            defaultValue={ description }
                            onChange={ e => setDescription(e.currentTarget.value) }
                            maxLength={ DESCRIPTION_MAX_LENGTH }
                            rows={ 5 } />
                    </FormGroup>
                    <FormGroup>
                        <Label for="disruption-detail__url">
                            <span className="font-size-md font-weight-bold">{ getOptionalLabel(LABEL_URL) }</span>
                        </Label>
                        <Input id="disruption-detail__url"
                            className="border border-dark"
                            defaultValue={ url }
                            onChange={ e => setUrl(e.currentTarget.value) }
                            placeholder="e.g. https://at.govt.nz"
                            maxLength={ URL_MAX_LENGTH }
                            invalid={ !isUrlValid(url) }
                        />
                        <FormFeedback>Please enter a valid URL (e.g. https://at.govt.nz)</FormFeedback>
                    </FormGroup>
                </div>
                <div className="col-4">
                    <DisruptionLabelAndText id="disruption-detail__created-by" label={ LABEL_CREATED_BY } text={ `${disruption.createdBy}, ${formatCreatedUpdatedTime(disruption.createdTime)}` } />
                    <DisruptionLabelAndText id="disruption-detail__last-updated" label={ LABEL_LAST_UPDATED_BY } text={ `${disruption.lastUpdatedBy}, ${formatCreatedUpdatedTime(disruption.lastUpdatedTime)}` } />
                    <FormGroup className="pl-0 d-flex align-items-center">
                        <Button
                            className="cc-btn-primary mr-3"
                            onClick={ handleUpdateDisruption }
                            disabled={ isUpdating || isSaveDisabled || !startTimeValid() || !startDateValid() || !endTimeValid() || !endDateValid() }>
                            Save Update
                        </Button>
                        <Button
                            className="control-messaging-view__stop-groups-btn cc-btn-secondary ml-3"
                            onClick={ () => setDisruptionsDetailsModalOpen(true) }>
                            Show Summary
                        </Button>
                        <DisruptionSummaryModal
                            disruption={ disruption }
                            isModalOpen={ disruptionsDetailsModalOpen }
                            onClose={ () => setDisruptionsDetailsModalOpen(false) } />
                        {isUpdating && <DetailLoader />}
                    </FormGroup>
                </div>
            </div>
        </Form>
    );
};

InProgress.propTypes = {
    disruption: PropTypes.object.isRequired,
    updateDisruption: PropTypes.func.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    resultDisruptionId: PropTypes.number,
};

InProgress.defaultProps = {
    resultDisruptionId: null,
};

export default InProgress;
