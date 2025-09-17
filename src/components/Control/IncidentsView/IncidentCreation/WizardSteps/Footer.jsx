import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';

export const Footer = props => (
    <footer className="row m-0 justify-content-between p-4 position-fixed incident-footer-min-height">
        <div className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'col-3' : 'col-4' }>
            { props.onBack && (
                <Button
                    className="btn cc-btn-link"
                    onClick={ props.onBack }>
                    Go back
                </Button>
            )}
        </div>
        <div className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'col-3 pl-0' : 'col-4 pl-0' }>
            <Button
                className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'btn cc-btn-secondary btn-block' : 'btn cc-btn-secondary btn-block pl-0' }
                onClick={ () => {
                    props.toggleIncidentModals('isCancellationOpen', true);
                } }>
                Cancel
            </Button>
        </div>
        { (props.useDraftDisruptions && props.isDraftOrCreateMode) && (
            <div className="col-3 pl-0">
                <Button
                    className="btn cc-btn-secondary btn-block"
                    disabled={ props.isDraftSubmitDisabled }
                    onClick={ props.onSubmitDraft }>
                    { props.saveDraftButtonValue }
                </Button>
            </div>
        )}
        <div className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'col-3 pl-0' : 'col-4' }>
            <Button
                disabled={ props.isSubmitDisabled }
                className="btn cc-btn-primary btn-block continue"
                onClick={ props.onContinue }>
                { props.nextButtonValue }
            </Button>
        </div>
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
    saveDraftButtonValue: PropTypes.string,
};

Footer.defaultProps = {
    isSubmitDisabled: false,
    isDraftSubmitDisabled: false,
    useDraftDisruptions: false,
    isDraftOrCreateMode: true,
    onBack: null,
    onSubmitDraft: () => {},
    saveDraftButtonValue: 'Save draft',
};

export default connect(
    state => ({
        useDraftDisruptions: useDraftDisruptions(state),
    }),
    {
    },
)(Footer);
