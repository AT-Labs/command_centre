import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';

export const Footer = props => (
    <footer className="row m-0 justify-content-between p-4 position-fixed incident-footer-min-height">
        <div className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'col-2' : 'col-3' }>
            { props.onBack && (
                <Button
                    className="btn cc-btn-link"
                    onClick={ props.onBack }>
                    Go back
                </Button>
            )}
        </div>
        <div className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'col-2 pl-0' : 'col-3 pl-0' }>
            <Button
                className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'btn cc-btn-secondary btn-block' : 'btn cc-btn-secondary btn-block pl-0' }
                onClick={ () => {
                    props.toggleIncidentModals('isCancellationOpen', true);
                } }>
                Cancel
            </Button>
        </div>
        { (props.useDraftDisruptions && props.isDraftOrCreateMode) && (
            <div className="col-2 pl-0">
                <Button
                    className="btn cc-btn-secondary btn-block"
                    disabled={ props.isDraftSubmitDisabled }
                    onClick={ props.onSubmitDraft }>
                    Save draft
                </Button>
            </div>
        )}
        <div className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'col-2 pl-0' : 'col-3' }>
            <Button
                disabled={ props.isSubmitDisabled }
                className="btn cc-btn-primary btn-block continue"
                onClick={ props.onContinue }>
                { props.nextButtonValue }
            </Button>
        </div>
        { props.showFinishButton && (
            <div className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'col-2 pl-0' : 'col-3 pl-0' }>
                <Button
                    disabled={ props.isFinishDisabled }
                    className="btn cc-btn-success btn-block"
                    onClick={ props.onFinish }>
                    { props.finishButtonValue || 'Finish' }
                </Button>
            </div>
        )}
    </footer>
);

Footer.propTypes = {
    toggleIncidentModals: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onSubmitDraft: PropTypes.func,
    onBack: PropTypes.func,
    isDraftOrCreateMode: PropTypes.bool,
    isSubmitDisabled: PropTypes.bool,
    isDraftSubmitDisabled: PropTypes.bool,
    nextButtonValue: PropTypes.string.isRequired,
    useDraftDisruptions: PropTypes.bool,
    showFinishButton: PropTypes.bool,
    isFinishDisabled: PropTypes.bool,
    onFinish: PropTypes.func,
    finishButtonValue: PropTypes.string,
};

Footer.defaultProps = {
    isSubmitDisabled: false,
    isDraftSubmitDisabled: false,
    useDraftDisruptions: false,
    isDraftOrCreateMode: true,
    onBack: null,
    onSubmitDraft: () => {},
    showFinishButton: false,
    isFinishDisabled: false,
    finishButtonValue: 'Finish',
    onFinish: () => {},
};

export default connect(
    state => ({
        useDraftDisruptions: useDraftDisruptions(state),
    }),
    {
    },
)(Footer);
