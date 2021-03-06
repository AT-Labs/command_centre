import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { clearDisruptionActionResult, updateDisruption, updateCopyDisruptionState } from '../../../../redux/actions/control/disruptions';
import { getDisruptionAction, isDisruptionUpdateAllowed } from '../../../../redux/selectors/control/disruptions';

import Message from '../../Common/Message/Message';
import DisruptionDetailView from './DisruptionDetailView';
import Readonly from './Readonly';

const DisruptionExpandedDetail = (props) => {
    const { disruption, resultStatus, resultMessage, resultDisruptionId, isCopied } = props;

    if (isDisruptionUpdateAllowed(disruption)) {
        return (
            <React.Fragment>
                {resultStatus && resultDisruptionId === disruption.disruptionId && (
                    <Message
                        message={ {
                            id: `${disruption.disruptionId}`,
                            type: resultStatus,
                            body: resultMessage,
                        } }
                        onClose={ () => props.clearDisruptionActionResult() }
                    />
                )}
                {isCopied && (
                    <Message
                        message={ {
                            id: `${disruption.disruptionId}`,
                            type: 'success',
                            body: 'Disruption copied to clipboard',
                        } }
                        onClose={ () => props.clearDisruptionActionResult() }
                    />
                )}
                <DisruptionDetailView { ...props } />
            </React.Fragment>
        );
    }
    return <Readonly { ...props } />;
};

DisruptionExpandedDetail.propTypes = {
    resultStatus: PropTypes.string,
    resultMessage: PropTypes.string,
    resultDisruptionId: PropTypes.number,
    isRequesting: PropTypes.bool,
    disruption: PropTypes.object.isRequired,
    isCopied: PropTypes.bool,
    updateDisruption: PropTypes.func.isRequired,
    clearDisruptionActionResult: PropTypes.func.isRequired,
    updateCopyDisruptionState: PropTypes.func.isRequired,
};

DisruptionExpandedDetail.defaultProps = {
    resultStatus: null,
    resultMessage: null,
    isRequesting: false,
    resultDisruptionId: null,
    isCopied: false,
};

export default connect(state => getDisruptionAction(state), {
    updateDisruption,
    clearDisruptionActionResult,
    updateCopyDisruptionState,
})(DisruptionExpandedDetail);
