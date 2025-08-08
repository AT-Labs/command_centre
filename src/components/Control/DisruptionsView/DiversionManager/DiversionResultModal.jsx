import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

export const ACTION_TYPE = {
    RETURN_TO_DIVERSION: 'RETURN_TO_DIVERSION',
    RETURN_TO_DISRUPTION: 'RETURN_TO_DISRUPTION',
    NEW_DIVERSION: 'NEW_DIVERSION',
};

const DiversionResultModal = props => {
    console.log('🔧 DiversionResultModal - render');
    console.log('🔧 DiversionResultModal - props.result:', props.result);
    console.log('🔧 DiversionResultModal - props.error:', props.error);
    console.log('🔧 DiversionResultModal - props.showNewDiversionButton:', props.showNewDiversionButton);
    
    return (
    <div className="diversion__confirmation-modal">
        <div className="row">
            <div className="col text-center">
                <div>
                    <span className="d-block mt-3 mb-2">
                        { props.result }
                    </span>
                    <span className="d-block mt-3 mb-2 text-danger">
                        { props.error }
                    </span>
                </div>
            </div>
        </div>
        <footer>
            { props.error?.length > 0 ? (
                <div className="row justify-content-between mt-3">
                    <div className="col-5">
                        <Button
                            className="btn btn-block cc-btn-secondary btn-block"
                            aria-label="Return"
                            onClick={ () => props.onAction(ACTION_TYPE.RETURN_TO_DIVERSION) }>
                            Return
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="row justify-content-between mt-3">
                    <div className="col-7">
                        <Button
                            className="btn btn-block cc-btn-secondary btn-block"
                            aria-label="Go back to disruption page"
                            onClick={ () => {
                                console.log('🔧 DiversionResultModal - "Go back to disruption page" clicked');
                                props.onAction(ACTION_TYPE.RETURN_TO_DISRUPTION);
                            } }>
                            Go back to disruption page
                        </Button>
                    </div>
                    <div className="col-5">
                        { props.showNewDiversionButton && (
                            <Button
                                className="btn btn-block cc-btn-primary btn-block"
                                aria-label="Add new diversion"
                                onClick={ () => props.onAction(ACTION_TYPE.NEW_DIVERSION) }>
                                Add new diversion
                            </Button>
                        ) }
                    </div>
                </div>
            ) }
        </footer>
    </div>
    );
};

DiversionResultModal.propTypes = {
    result: PropTypes.string,
    error: PropTypes.string,
    showNewDiversionButton: PropTypes.bool,
    onAction: PropTypes.func.isRequired,
};

DiversionResultModal.defaultProps = {
    result: '',
    error: '',
    showNewDiversionButton: true,
};

export default DiversionResultModal;
