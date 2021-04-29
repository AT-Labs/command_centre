import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import Message from '../../../Common/Message/Message';
import DetailLoader from '../../../../Common/Loader/DetailLoader';
import { clearDisruptionActionResult, updateActiveDisruptionId, openCreateDisruption, deleteAffectedEntities } from '../../../../../redux/actions/control/disruptions';
import { isModalOpen } from '../../../../../redux/selectors/activity';

const Confirmation = (props) => {
    const { isRequesting, resultDisruptionId, resultMessage } = props.response;

    const renderContent = () => {
        if (isRequesting) return <DetailLoader />;
        return resultDisruptionId
            ? (
                <React.Fragment>
                    <h2>New disruption has been created</h2>
                    <div>
                        <span className="d-block mt-3 mb-2">{ resultMessage }</span><br />
                        <span>Please ensure you update the created disruption with new information as it becomes available.</span>
                    </div>
                </React.Fragment>
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

    return (
        <div className="disruption-creation__wizard-confirmation">
            <div className="row">
                <div className={ `col ${isRequesting ? 'd-flex justify-content-center' : ''}` }>
                    { renderContent() }
                </div>
            </div>
            { !isRequesting && (
                <footer className="row justify-content-between mt-3">
                    <div className="col-6">
                        {
                            resultDisruptionId && (
                                <Button
                                    className="btn cc-btn-primary btn-block"
                                    onClick={ () => {
                                        props.openCreateDisruption(false);
                                        props.deleteAffectedEntities();
                                        if (!props.isModalOpen) {
                                            setTimeout(() => props.updateActiveDisruptionId(resultDisruptionId), 0);
                                        }
                                    } }>
                                    Add more information
                                </Button>
                            )
                        }
                    </div>
                    <div className="col-4">
                        <Button
                            className="btn cc-btn-secondary btn-block"
                            onClick={ () => {
                                props.openCreateDisruption(false);
                                props.deleteAffectedEntities();
                            } }>
                            { resultDisruptionId ? 'Done' : 'Close' }
                        </Button>
                    </div>
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
};

Confirmation.defaultProps = {
    response: {},
};

export default connect(state => ({
    isModalOpen: isModalOpen(state),
}),
{
    clearDisruptionActionResult,
    updateActiveDisruptionId,
    openCreateDisruption,
    deleteAffectedEntities,
})(Confirmation);
