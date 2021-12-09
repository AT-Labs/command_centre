import { toString, omit, uniqBy, isEmpty } from 'lodash-es';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import { CAUSES, IMPACTS } from '../../../../types/disruptions-types';
import { getShapes, getDisruptionsLoadingState } from '../../../../redux/selectors/control/disruptions';
import {
    DATE_FORMAT,
    LABEL_CAUSE, LABEL_CREATED_BY,
    LABEL_CUSTOMER_IMPACT, LABEL_DESCRIPTION, LABEL_END_DATE, LABEL_END_TIME, LABEL_HEADER, LABEL_LAST_UPDATED_BY,
    LABEL_MODE, LABEL_START_DATE, LABEL_START_TIME, LABEL_STATUS, LABEL_URL,
    TIME_FORMAT,
} from '../../../../constants/disruptions';
import {
    getRoutesByShortName,
    updateAffectedRoutesState,
    updateAffectedStopsState,
} from '../../../../redux/actions/control/disruptions';
import { formatCreatedUpdatedTime } from '../../../../utils/control/disruptions';
import DisruptionLabelAndText from './DisruptionLabelAndText';
import DiversionUpload from './DiversionUpload';
import Map from '../DisruptionCreation/CreateDisruption/Map';
import AffectedEntities from '../AffectedEntities';

const Readonly = (props) => {
    const { disruption, isLoading } = props;

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
                        stops={ !isLoading ? disruption.affectedEntities.filter(entity => entity.stopId) : [] } />
                </section>
                <span className="map-note">Note: Only a max of ten routes will be displayed on the map.</span>
            </div>
            <div className="row mt-3">
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
                        <DisruptionLabelAndText
                            label={ LABEL_END_TIME }
                            id="disruption-detail__end-time"
                            text={ disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : '' } />
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
                </section>
            </div>
            <DiversionUpload
                disruption={ disruption }
                readonly
            />
            <div className="row">
                <div className="col-5 disruption-detail__contributors">
                    <DisruptionLabelAndText id="disruption-detail__created-by" label={ LABEL_CREATED_BY } text={ `${disruption.createdBy}, ${formatCreatedUpdatedTime(disruption.createdTime)}` } />
                    <DisruptionLabelAndText id="disruption-detail__last-updated" label={ LABEL_LAST_UPDATED_BY } text={ `${disruption.lastUpdatedBy}, ${formatCreatedUpdatedTime(disruption.lastUpdatedTime)}` } />
                </div>
            </div>
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
};

Readonly.defaultProps = {
    shapes: [],
    isLoading: false,
};

export default connect(state => ({
    shapes: getShapes(state),
    isLoading: getDisruptionsLoadingState(state),
}), {
    getRoutesByShortName,
    updateAffectedRoutesState,
    updateAffectedStopsState,
})(Readonly);
