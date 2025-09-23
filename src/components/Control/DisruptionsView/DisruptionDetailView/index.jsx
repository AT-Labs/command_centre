import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
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
import { DISRUPTION_POLLING_INTERVAL } from '../../../../constants/disruptions';
import DiversionManager from '../DiversionManager';
import { getIsDiversionManagerOpen } from '../../../../redux/selectors/control/diversions';
import { openDiversionManager } from '../../../../redux/actions/control/diversions';

const DisruptionDetailsPage = (props) => {
    const { resultStatus, resultMessage, resultDisruptionId, resultCreateNotification, isCopied } = props;
    const [disruption, setDisruption] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const abortControllerRef = useRef(null);

    useEffect(() => {
        const fetchData = async (showLoading) => {
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            try {
                if (showLoading) {
                    setLoading(true);
                }
                const result = await getDisruptionAPI(props.activeControlEntityId, abortController.signal);
                const { _links: { permissions } } = result;
                setDisruption(result);
                props.updateDisruptionsPermissions(permissions);
            } catch (error) {
                setErrorMessage(`An error has occurred while getting the disruption(${transformIncidentNo(props.activeControlEntityId)})`);
            } finally {
                if (showLoading) {
                    setLoading(false);
                }
            }
        };

        // fetch the disruption data and show the loading screen for the first time.
        fetchData(true);

        const refreshInterval = setInterval(() => {
            // make sure all the pending calls are cancelled before making the next one
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            fetchData(false);
        }, DISRUPTION_POLLING_INTERVAL);

        return () => {
            props.updateActiveControlEntityId('');
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            clearInterval(refreshInterval);
        };
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            console.log('🔍 DisruptionDetailsPage - Visibility change detected:', {
                documentHidden: document.hidden,
                isDiversionManagerOpen: props.isDiversionManagerOpen
            });
            
            if (document.hidden && props.isDiversionManagerOpen) {
                console.log('🚪 DisruptionDetailsPage - Closing diversion manager via visibilitychange');
                props.openDiversionManager(false);
            }
        };

        console.log('📝 DisruptionDetailsPage - Adding visibilitychange listener');
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            console.log('🧹 DisruptionDetailsPage - Removing visibilitychange listener');
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []); // Убираем зависимость, чтобы listener создавался только один раз

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
            { props.isDiversionManagerOpen
                ? <DiversionManager disruption={ disruption } onCancelled={ () => props.openDiversionManager(false) } />
                : (
                    <>
                        <h2>
                            Disruption
                            {' '}
                            {transformIncidentNo(disruption.disruptionId)}
                        </h2>
                        <DisruptionDetail { ...{ ...props, disruption } } isReadOnlyMode={ !isDisruptionUpdateAllowed(disruption) } />
                    </>
                )}
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
    isDiversionManagerOpen: PropTypes.bool,
    openDiversionManager: PropTypes.func.isRequired,
};

DisruptionDetailsPage.defaultProps = {
    resultStatus: null,
    resultMessage: null,
    resultCreateNotification: false,
    resultDisruptionId: null,
    isCopied: false,
    isDiversionManagerOpen: false,
};

export default connect(state => ({
    ...getDisruptionAction(state),
    activeControlEntityId: getActiveControlEntityId(state),
    isDiversionManagerOpen: getIsDiversionManagerOpen(state),
}), {
    clearDisruptionActionResult,
    updateActiveControlEntityId,
    updateDisruptionsPermissions,
    openDiversionManager,
})(DisruptionDetailsPage);
