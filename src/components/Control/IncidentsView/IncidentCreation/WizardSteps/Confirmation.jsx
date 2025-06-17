import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { GridLinkOperator } from '@mui/x-data-grid-pro';
import Message from '../../../Common/Message/Message';
import DetailLoader from '../../../../Common/Loader/DetailLoader';
import {
    clearDisruptionActionResult,
    updateActiveDisruptionId,
    openCreateIncident, deleteAffectedEntities, updateDisruptionsDatagridConfig } from '../../../../../redux/actions/control/incidents';
import { isModalOpen } from '../../../../../redux/selectors/activity';
import { getDisruptionsDatagridConfig } from '../../../../../redux/selectors/control/incidents';
import { goToNotificationsView } from '../../../../../redux/actions/control/link';
import { useDisruptionsNotificationsDirectLink } from '../../../../../redux/selectors/appSettings';

const Confirmation = (props) => {
    const { isRequesting, resultDisruptionId, resultMessage, resultCreateNotification } = props.response;
    const renderContent = () => {
        if (isRequesting) return <DetailLoader />;
        return resultDisruptionId
            ? (
                <>
                    <h2>New disruption has been created</h2>
                    <div>
                        <span className="d-block mt-3 mb-2">{ resultMessage }</span>
                        { resultCreateNotification && <span className="d-block mt-3 mb-2">Draft stop message has been created</span> }
                        <br />
                        <span>Please ensure you update the created disruption with new information as it becomes available.</span>
                    </div>
                </>
            )
            : (
                <Message
                    autoDismiss={ false }
                    isDismissible={ false }
                    onClose={ () => {
                        props.clearDisruptionActionResult();
                        props.openCreateDisruption(false);
                    } }
                    message={ {
                        id: '',
                        body: resultMessage,
                        type: 'danger',
                    } } />
            );
    };

    const getDisruptionDetailsButtonLabel = () => {
        if (props.useDisruptionsNotificationsDirectLink) {
            return 'View disruption details';
        }
        return 'View and add more information';
    };

    return (
        <div className="disruption-creation__wizard-confirmation">
            <div className="row">
                <div className={ `col ${isRequesting ? 'd-flex justify-content-center' : ''}` }>
                    { renderContent() }
                </div>
            </div>
            { !isRequesting && (
                <footer className="row justify-content-between mt-3">
                    <div className={ props.useDisruptionsNotificationsDirectLink && resultDisruptionId ? 'col-12 mb-4' : 'col-4' }>
                        {
                            resultDisruptionId && (
                                <Button
                                    className="btn cc-btn-primary btn-block"
                                    onClick={ () => {
                                        props.openCreateDisruption(false);
                                        props.deleteAffectedEntities();
                                    } }>
                                    { props.useDisruptionsNotificationsDirectLink ? 'View all disruptions' : 'View all' }
                                </Button>
                            )
                        }
                    </div>
                    <div className={ props.useDisruptionsNotificationsDirectLink && resultDisruptionId ? 'col-6' : 'col-8' }>
                        <Button
                            className="btn cc-btn-primary btn-block"
                            onClick={ () => {
                                props.openCreateDisruption(false);
                                props.deleteAffectedEntities();
                                if (!props.isModalOpen && resultDisruptionId) {
                                    props.updateDisruptionsDatagridConfig({ ...props.datagridConfig, filterModel: { items: [], linkOperator: GridLinkOperator.And } });
                                    setTimeout(() => props.updateActiveDisruptionId(resultDisruptionId), 0);
                                }
                            } }>
                            { resultDisruptionId ? getDisruptionDetailsButtonLabel() : 'Close' }
                        </Button>
                    </div>
                    { props.useDisruptionsNotificationsDirectLink && resultDisruptionId && (
                        <div className="col-6">
                            <Button
                                className="btn cc-btn-primary btn-block"
                                onClick={ () => {
                                    props.openCreateDisruption(false);
                                    props.deleteAffectedEntities();
                                    props.goToNotificationsView({
                                        version: props.response.resultDisruptionVersion,
                                        disruptionId: props.response.resultDisruptionId,
                                        source: 'DISR',
                                        new: true,
                                    });
                                } }>
                                View notification details
                            </Button>
                        </div>
                    ) }
                </footer>
            )}
        </div>
    );
};

Confirmation.propTypes = {
    response: PropTypes.object,
    clearDisruptionActionResult: PropTypes.func.isRequired, // eslint-disable-line
    updateActiveDisruptionId: PropTypes.func.isRequired,
    isModalOpen: PropTypes.bool.isRequired,
    openCreateDisruption: PropTypes.func.isRequired,
    deleteAffectedEntities: PropTypes.func.isRequired,
    datagridConfig: PropTypes.object.isRequired,
    updateDisruptionsDatagridConfig: PropTypes.func.isRequired,
    goToNotificationsView: PropTypes.func.isRequired,
    useDisruptionsNotificationsDirectLink: PropTypes.bool.isRequired,
};

Confirmation.defaultProps = {
    response: {},
};

export default connect(
    state => ({
        isModalOpen: isModalOpen(state),
        datagridConfig: getDisruptionsDatagridConfig(state),
        useDisruptionsNotificationsDirectLink: useDisruptionsNotificationsDirectLink(state),
    }),
    {
        clearDisruptionActionResult,
        updateActiveDisruptionId,
        openCreateIncident,
        deleteAffectedEntities,
        updateDisruptionsDatagridConfig,
        goToNotificationsView,
    },
)(Confirmation);
