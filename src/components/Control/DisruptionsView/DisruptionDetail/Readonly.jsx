import { toString, omit, uniqBy, isEmpty } from 'lodash-es';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Form, FormGroup, Input, Label, Button } from 'reactstrap';
import { BsArrowRepeat } from 'react-icons/bs';
import { CAUSES, IMPACTS } from '../../../../types/disruptions-types';
import { getShapes, getDisruptionsLoadingState } from '../../../../redux/selectors/control/disruptions';
import {
    DATE_FORMAT,
    LABEL_CAUSE, LABEL_CREATED_BY,
    LABEL_CUSTOMER_IMPACT, LABEL_DESCRIPTION, LABEL_DURATION, LABEL_END_DATE, LABEL_END_TIME, LABEL_HEADER, LABEL_LAST_UPDATED_BY,
    LABEL_MODE, LABEL_START_DATE, LABEL_START_TIME, LABEL_STATUS, LABEL_URL,
    TIME_FORMAT,
} from '../../../../constants/disruptions';
import {
    getRoutesByShortName,
    updateAffectedRoutesState,
    updateAffectedStopsState,
} from '../../../../redux/actions/control/disruptions';
import { formatCreatedUpdatedTime, recurrenceRadioOptions } from '../../../../utils/control/disruptions';
import { getRecurrenceText, parseRecurrencePattern } from '../../../../utils/recurrence';
import DisruptionLabelAndText from './DisruptionLabelAndText';
import DiversionUpload from './DiversionUpload';
import Map from '../DisruptionCreation/CreateDisruption/Map';
import AffectedEntities from '../AffectedEntities';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../Common/ActivePeriods/ActivePeriods';
import WeekdayPicker from '../../Common/WeekdayPicker/WeekdayPicker';
import { useDisruptionRecurrence } from '../../../../redux/selectors/appSettings';
import RadioButtons from '../../../Common/RadioButtons/RadioButtons';

const Readonly = (props) => {
    const { disruption, isLoading } = props;

    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);

    const affectedEntitiesWithoutShape = toString(disruption.affectedEntities.map(entity => omit(entity, ['shapeWkt'])));
    useEffect(() => {
        const affectedStops = disruption.affectedEntities.filter(entity => entity.stopId);
        const affectedRoutes = disruption.affectedEntities.filter(entity => entity.routeId && isEmpty(entity.stopId));

        props.updateAffectedStopsState(affectedStops);
        props.updateAffectedRoutesState(affectedRoutes);

        const routesToGet = uniqBy([...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)], item => item.routeId);

        if (routesToGet.length) {
            props.getRoutesByShortName(routesToGet.slice(0, 10));
        }
    }, [affectedEntitiesWithoutShape]);

    return (
        <Form>
            <div className="row position-relative">
                <AffectedEntities
                    isEditDisabled
                    affectedEntities={ disruption.affectedEntities }
                />
                <section className="position-relative w-50 d-flex disruption-detail__map">
                    <Map shouldOffsetForSidePanel={ false }
                        shapes={ !isLoading ? props.shapes : [] }
                        stops={ !isLoading ? disruption.affectedEntities.filter(entity => entity.stopId).slice(0, 10) : [] } />
                </section>
                <span className="map-note">Note: Only a max of ten routes and ten stops will be displayed on the map.</span>
            </div>
            <div className="row mt-3">
                { props.isRecurrenceOn && (
                    <section className="col-12">
                        <RadioButtons { ...recurrenceRadioOptions(disruption.recurrent) } />
                    </section>
                )}
                <section className="col-3">
                    <div className="mt-2 position-relative form-group">
                        <DisruptionLabelAndText label={ LABEL_MODE } id="disruption-detail__mode" text={ disruption.mode } />
                    </div>
                    <div className="mt-2 position-relative form-group">
                        <DisruptionLabelAndText label={ LABEL_CAUSE } id="disruption-detail__cause" text={ CAUSES.find(cause => cause.value === disruption.cause).label } />
                    </div>
                    <div className="mt-2 position-relative form-group">
                        <DisruptionLabelAndText
                            label={ LABEL_START_DATE }
                            id="disruption-detail__start-date"
                            text={ moment(disruption.startTime).format(DATE_FORMAT) } />
                    </div>
                    <div className="mt-2 position-relative form-group">
                        <DisruptionLabelAndText
                            label={ LABEL_END_DATE }
                            id="disruption-detail__end-date"
                            text={ disruption.endTime ? moment(disruption.endTime).format(DATE_FORMAT) : '' } />
                    </div>
                    <div className="mt-2 position-relative form-group">
                        { disruption.recurrent && (
                            <>
                                <FormGroup>
                                    <WeekdayPicker
                                        selectedWeekdays={ disruption.recurrencePattern.byweekday || [] }
                                        disabled
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <BsArrowRepeat size={ 22 } />
                                    <span className="pl-1">{ getRecurrenceText(parseRecurrencePattern(disruption.recurrencePattern)) }</span>
                                </FormGroup>
                            </>
                        )}
                    </div>
                </section>
                <section className="col-3">
                    <div className="mt-2 position-relative form-group">
                        <DisruptionLabelAndText label={ LABEL_STATUS } id="disruption-detail__status" text={ disruption.status } />
                    </div>
                    <div className="mt-2 position-relative form-group">
                        <DisruptionLabelAndText
                            label={ LABEL_CUSTOMER_IMPACT }
                            id="disruption-detail__impact"
                            text={ IMPACTS.find(impact => impact.value === disruption.impact).label } />
                    </div>
                    <div className="mt-2 position-relative form-group">
                        <DisruptionLabelAndText
                            label={ LABEL_START_TIME }
                            id="disruption-detail__start-time"
                            text={ moment(disruption.startTime).format(TIME_FORMAT) } />
                    </div>
                    <div className="mt-2 position-relative form-group">
                        { !disruption.recurrent && (
                            <DisruptionLabelAndText
                                label={ LABEL_END_TIME }
                                id="disruption-detail__end-time"
                                text={ disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : '' } />
                        )}
                        { disruption.recurrent && (
                            <DisruptionLabelAndText
                                label={ LABEL_DURATION }
                                id="disruption-detail__duration"
                                text={ disruption.duration } />
                        )}
                    </div>
                </section>
                <section className="col-6">
                    <FormGroup>
                        <Label for="disruption-detail__header">
                            <span className="font-size-md font-weight-bold">{LABEL_HEADER}</span>
                        </Label>
                        <Input id="disruption-detail__header"
                            defaultValue={ disruption.header }
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
                    <FormGroup>
                        <Label for="disruption-detail__description">
                            <span className="font-size-md font-weight-bold">{LABEL_DESCRIPTION}</span>
                        </Label>
                        <Input id="disruption-detail__description"
                            className="textarea-no-resize"
                            type="textarea"
                            value={ disruption.description }
                            rows={ 4 }
                            disabled />
                    </FormGroup>
                    { disruption.recurrent && (
                        <FormGroup>
                            <Button className="cc-btn-primary" onClick={ () => setActivePeriodsModalOpen(true) }>View all</Button>
                        </FormGroup>
                    )}
                </section>
            </div>
            <DiversionUpload
                disruption={ disruption }
                readonly
                disabled
            />
            <div className="row">
                <div className="col-5 disruption-detail__contributors">
                    <DisruptionLabelAndText id="disruption-detail__created-by" label={ LABEL_CREATED_BY } text={ `${disruption.createdBy}, ${formatCreatedUpdatedTime(disruption.createdTime)}` } />
                    <DisruptionLabelAndText id="disruption-detail__last-updated" label={ LABEL_LAST_UPDATED_BY } text={ `${disruption.lastUpdatedBy}, ${formatCreatedUpdatedTime(disruption.lastUpdatedTime)}` } />
                </div>
            </div>
            <CustomMuiDialog
                title="Disruption Active Periods"
                onClose={ () => setActivePeriodsModalOpen(false) }
                isOpen={ activePeriodsModalOpen }>
                <ActivePeriods activePeriods={ disruption.activePeriods } />
            </CustomMuiDialog>
        </Form>
    );
};

Readonly.propTypes = {
    disruption: PropTypes.object.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    shapes: PropTypes.array,
    isLoading: PropTypes.bool,
    isRecurrenceOn: PropTypes.bool.isRequired,
};

Readonly.defaultProps = {
    shapes: [],
    isLoading: false,
};

export default connect(state => ({
    shapes: getShapes(state),
    isLoading: getDisruptionsLoadingState(state),
    isRecurrenceOn: useDisruptionRecurrence(state),
}), {
    getRoutesByShortName,
    updateAffectedRoutesState,
    updateAffectedStopsState,
})(Readonly);
