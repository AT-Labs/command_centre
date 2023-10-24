import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Message from '../../Common/Message/Message';
import DisruptionDetail from './DisruptionDetail';
import Loader from '../../../Common/Loader/Loader';
import {
    clearDisruptionActionResult,
    updateDisruptionsPermissions,
} from '../../../../redux/actions/control/disruptions';
import { getDisruptionAction, isDisruptionUpdateAllowed } from '../../../../redux/selectors/control/disruptions';
import { updateActiveControlEntityId } from '../../../../redux/actions/navigation';
import { getActiveControlEntityId } from '../../../../redux/selectors/navigation';
import { getDisruption as getDisruptionAPI } from '../../../../utils/transmitters/disruption-mgt-api';
import { transformIncidentNo } from '../../../../utils/control/disruptions';

const DisruptionDetailsPage = (props) => {
    const { resultStatus, resultMessage, resultDisruptionId, resultCreateNotification, isCopied } = props;
    const [disruption, setDisruption] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(async () => {
        try {
            const result = await getDisruptionAPI(props.activeControlEntityId);
            const { _links: { permissions } } = result;
            setDisruption(result);
            props.updateDisruptionsPermissions(permissions);
        } catch (error) {
            setErrorMessage(`An error has occurred while getting the disruption(${transformIncidentNo(props.activeControlEntityId)})`);
        } finally {
            setLoading(false);
        }
        return () => {
            props.updateActiveControlEntityId('');
        };
    }, []);

    useEffect(async () => {
        const result = await getDisruptionAPI(props.activeControlEntityId);
        setDisruption(result);
    }, [resultStatus]);

    let message = resultMessage;

    if (resultCreateNotification) {
        message = `${resultMessage} Draft stop message has been created.`;
    }

    if (loading) {
        return (
            <div className="w-100 d-flex align-items-center justify-content-center">
                <section style={ { height: 100, width: 100 } }>
                    <Loader />
                </section>
            </div>
        );
    }

    if (!disruption) {
        return (
            <div className="m-4">
                <Message
                    message={ {
                        id: `${props.activeControlEntityId}`,
                        type: 'danger',
                        body: errorMessage,
                    } }
                    onClose={ () => props.clearDisruptionActionResult() }
                    autoDismiss={ false }
                    isDismissible={ false }
                />
            </div>
        );
    }

    return (
        <div className="p-4">
            {resultStatus && resultDisruptionId === disruption.disruptionId && (
                <Message
                    message={ {
                        id: `${disruption.disruptionId}`,
                        type: resultStatus,
                        body: message,
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
            <h2>
                Disruption
                {' '}
                {transformIncidentNo(disruption.disruptionId)}
            </h2>
            <DisruptionDetail { ...{ ...props, disruption } } isReadOnlyMode={ !isDisruptionUpdateAllowed(disruption) } />
        </div>
    );
};

DisruptionDetailsPage.propTypes = {
    resultStatus: PropTypes.string,
    resultMessage: PropTypes.string,
    resultCreateNotification: PropTypes.bool,
    resultDisruptionId: PropTypes.number,
    isCopied: PropTypes.bool,
    clearDisruptionActionResult: PropTypes.func.isRequired,
    activeControlEntityId: PropTypes.string.isRequired,
    updateActiveControlEntityId: PropTypes.func.isRequired,
    updateDisruptionsPermissions: PropTypes.func.isRequired,
};

DisruptionDetailsPage.defaultProps = {
    resultStatus: null,
    resultMessage: null,
    resultCreateNotification: false,
    resultDisruptionId: null,
    isCopied: false,
};

export default connect(state => ({
    ...getDisruptionAction(state),
    activeControlEntityId: getActiveControlEntityId(state),
}), {
    clearDisruptionActionResult,
    updateActiveControlEntityId,
    updateDisruptionsPermissions,
})(DisruptionDetailsPage);
