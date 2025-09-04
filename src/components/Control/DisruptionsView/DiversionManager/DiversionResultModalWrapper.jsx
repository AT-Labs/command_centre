import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getDiversionResultState, getDiversionEditMode } from '../../../../redux/selectors/control/diversions';
import { resetDiversionResult as resetDiversionResultAction } from '../../../../redux/actions/control/diversions';
import DiversionResultModal, { ACTION_TYPE } from './DiversionResultModal';

const PortalModal = ({ isOpen, children, className }) => {
    const [portalContainer, setPortalContainer] = useState(null);

    useEffect(() => {
        let container = document.getElementById('portal-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'portal-container';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 100000;
            `;
            document.body.appendChild(container);
        }
        setPortalContainer(container);

        return () => {
            if (container && container.children.length === 0) {
                container.remove();
            }
        };
    }, []);

    if (!isOpen || !portalContainer) {
        return null;
    }

    return createPortal(
        <div className={ className }>
            {children}
        </div>,
        portalContainer,
    );
};

const DiversionResultModalWrapper = ({
    resultState,
    editMode,
    resetDiversionResult,
    onNewDiversion,
    onReturnToDisruption,
}) => {
    const isEditingMode = editMode === 'EDIT';

    let title;
    if (resultState?.error) {
        title = 'Creation Failed';
    } else if (resultState?.diversionId) {
        title = 'Success';
    } else {
        title = `${isEditingMode ? 'Edit' : 'Add'} Diversion`;
    }

    const handleResultAction = (action) => {
        document.body.classList.remove('diversion-result-active');
        resetDiversionResult();

        if (action === ACTION_TYPE.NEW_DIVERSION) {
            if (onNewDiversion) {
                onNewDiversion();
            }
        } else if (action === ACTION_TYPE.RETURN_TO_DISRUPTION) {
            if (onReturnToDisruption) {
                onReturnToDisruption();
            }
        }
    };

    const isModalOpen = !resultState.isLoading && (!!resultState?.diversionId || !!resultState?.error);

    useEffect(() => {
        const styleId = 'diversion-modal-styles';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        const handleBodyClick = (event) => {
            if (event.target.classList.contains('diversion-result-modal')) {
                document.body.classList.remove('diversion-result-active');
                resetDiversionResult();
                if (onNewDiversion) {
                    onNewDiversion();
                }
            }
        };

        document.body.addEventListener('click', handleBodyClick);

        style.textContent = `
            .diversion-result-modal {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                pointer-events: auto !important;
                z-index: 100000 !important;
                background-color: rgba(0, 0, 0, 0.5) !important;
            }
            .diversion-result-modal > div:first-child {
                pointer-events: auto !important;
                cursor: pointer !important;
            }
            .diversion-result-modal > div > div {
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                margin: 0 !important;
                background-color: white !important;
                border-radius: 8px !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
                border: 1px solid #dee2e6 !important;
                max-width: 500px !important;
                width: 500px !important;
            }
            .diversion-result-modal .modal-header {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                position: relative !important;
            }
            .diversion-result-modal .modal-header h4 {
                text-align: center !important;
                margin: 0 !important;
                flex: 1 !important;
            }
        `;

        if (isModalOpen) {
            document.body.classList.add('diversion-result-active');
        } else {
            document.body.classList.remove('diversion-result-active');
        }

        return () => {
            document.body.classList.remove('diversion-result-active');
            document.body.removeEventListener('click', handleBodyClick);
        };
    }, [isModalOpen]);

    if (!isModalOpen) {
        return null;
    }

    return (
        <PortalModal
            isOpen={ isModalOpen }
            className="diversion-result-modal"
            onClick={ () => {
                document.body.classList.remove('diversion-result-active');
                resetDiversionResult();
                if (onNewDiversion) {
                    onNewDiversion();
                }
            } }
        >
            <div
                role="button"
                tabIndex={ 0 }
                onClick={ () => {
                    document.body.classList.remove('diversion-result-active');
                    resetDiversionResult();
                    if (onNewDiversion) {
                        onNewDiversion();
                    }
                } }
                onKeyDown={ (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        document.body.classList.remove('diversion-result-active');
                        resetDiversionResult();
                        if (onNewDiversion) {
                            onNewDiversion();
                        }
                    }
                } }
            >
                <div
                    role="button"
                    tabIndex={ 0 }
                    onClick={ e => e.stopPropagation() }
                    onKeyDown={ e => e.stopPropagation() }
                >
                    <div className="modal-header"
                        style={ {
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '15px 20px',
                            borderBottom: '1px solid #dee2e6',
                            backgroundColor: '#f8f9fa',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                        } }>
                        <h4 style={ {
                            margin: 0,
                            color: '#495057',
                            fontSize: '18px',
                            fontWeight: '600',
                        } }>
                            {title}
                        </h4>
                    </div>

                    <div style={ { padding: '20px' } }>
                        <DiversionResultModal
                            showNewDiversionButton={ !isEditingMode }
                            result={ resultState?.diversionId ? `Diversion #${resultState.diversionId} has been created successfully.` : null }
                            error={ resultState?.error?.message }
                            onAction={ handleResultAction }
                        />
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

DiversionResultModalWrapper.propTypes = {
    resultState: PropTypes.object.isRequired,
    editMode: PropTypes.string.isRequired,
    resetDiversionResult: PropTypes.func.isRequired,
    onNewDiversion: PropTypes.func,
    onReturnToDisruption: PropTypes.func,
};

DiversionResultModalWrapper.defaultProps = {
    onNewDiversion: null,
    onReturnToDisruption: null,
};

export default connect(state => ({
    resultState: getDiversionResultState(state),
    editMode: getDiversionEditMode(state),
}), {
    resetDiversionResult: resetDiversionResultAction,
})(DiversionResultModalWrapper);
