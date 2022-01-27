import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { getStopDetail } from '../../../../redux/selectors/realtime/detail';
import { updateControlDetailView, updateMainView } from '../../../../redux/actions/navigation';
import { getStopMessagesAndPermissions, toggleModals } from '../../../../redux/actions/control/stopMessaging';
import { getStopMessagesPermissions } from '../../../../redux/selectors/control/stopMessaging/stopMessages';
import MESSAGING_MODAL_TYPE from '../../../../types/messaging-modal-types';
import VIEW_TYPE from '../../../../types/view-types';
import { formatStopLabel } from '../../../../utils/helpers';
import { isGlobalEditStopMessagesPermitted } from '../../../../utils/user-permissions';
import { IS_LOGIN_NOT_REQUIRED } from '../../../../auth';

const StopDetails = (props) => {
    const isGlobalEditMessagesPermitted = IS_LOGIN_NOT_REQUIRED || isGlobalEditStopMessagesPermitted(props.stopMessagesPermissions);

    useEffect(() => {
        props.getStopMessagesAndPermissions();
    }, []);

    const { stopDetail } = props;

    return (
        <section className="stop-detail-view__stop-details col-12 pt-3 border-bottom">
            <h2>
                <div className="d-flex justify-content-between">
                    <span>
                        Stop
                        {' '}
                        {stopDetail.stop_code}
                    </span>
                    {isGlobalEditMessagesPermitted && (
                        <Button
                            className="cc-btn-primary btn btn-secondary"
                            size="sm"
                            onClick={ () => {
                                props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.STOP_MESSAGES);
                                props.toggleModals(MESSAGING_MODAL_TYPE.CREATE, {
                                    stopsAndGroups: [{ value: stopDetail.stop_code, label: formatStopLabel(stopDetail) }],
                                });
                            } }>
                            <span>Create new message</span>
                        </Button>
                    )}
                </div>
                <div>
                    { stopDetail.stop_name }
                </div>
            </h2>
        </section>
    );
};

StopDetails.propTypes = {
    stopDetail: PropTypes.object.isRequired,
    updateMainView: PropTypes.func.isRequired,
    updateControlDetailView: PropTypes.func.isRequired,
    toggleModals: PropTypes.func.isRequired,
    stopMessagesPermissions: PropTypes.array.isRequired,
    getStopMessagesAndPermissions: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        stopDetail: getStopDetail(state),
        stopMessagesPermissions: getStopMessagesPermissions(state),
    }),
    { getStopMessagesAndPermissions, updateMainView, updateControlDetailView, toggleModals },
)(StopDetails);
