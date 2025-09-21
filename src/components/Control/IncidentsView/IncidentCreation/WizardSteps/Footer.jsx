import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { useDraftDisruptions, useAdditionalFrontendChanges } from '../../../../../redux/selectors/appSettings';

export const Footer = (props) => {
    const getColumnClass = (baseClass, additionalClass = '') => {
        if (props.isAddEffectsStep && props.additionalFrontendChangesEnabled) {
            return `col-2${additionalClass}`;
        }
        if (props.useDraftDisruptions && props.isDraftOrCreateMode) {
            return `col-3${additionalClass}`;
        }
        return `${baseClass}${additionalClass}`;
    };

    return (
        <footer className={ `row m-0 justify-content-between p-4 position-fixed incident-footer-min-height ${props.showFinishButton && props.isAddEffectsStep ? 'footer-with-finish-button' : ''} ${props.additionalFrontendChangesEnabled ? 'additional-frontend-changes-enabled' : ''}` }>
            <div className={ getColumnClass('col-4') }>
                { props.onBack && (
                    <Button
                        className="btn cc-btn-link"
                        onClick={ props.onBack }>
                        Go back
                    </Button>
                )}
            </div>
            <div className={ getColumnClass('col-4', ' pl-0') }>
                <Button
                    className={ (props.useDraftDisruptions && props.isDraftOrCreateMode) ? 'btn cc-btn-secondary btn-block' : 'btn cc-btn-secondary btn-block pl-0' }
                    onClick={ () => {
                        props.toggleIncidentModals('isCancellationOpen', true);
                    } }>
                    Cancel
                </Button>
            </div>
            { (props.useDraftDisruptions && props.isDraftOrCreateMode) && (
                <div className={ getColumnClass('col-3', ' pl-0') }>
                    <Button
                        className="btn cc-btn-secondary btn-block"
                        disabled={ props.isDraftSubmitDisabled }
                        onClick={ props.onSubmitDraft }>
                        { props.saveDraftButtonValue }
                    </Button>
                </div>
            )}
            <div className={ getColumnClass('col-4', props.useDraftDisruptions && props.isDraftOrCreateMode ? ' pl-0' : '') }>
                <Button
                    disabled={ props.isSubmitDisabled }
                    className="btn cc-btn-primary btn-block continue"
                    onClick={ props.onContinue }>
                    { props.nextButtonValue }
                </Button>
            </div>
            { props.showFinishButton && (
                <div className="col-2 pl-0">
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
};

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
    isAddEffectsStep: PropTypes.bool,
    isFinishDisabled: PropTypes.bool,
    onFinish: PropTypes.func,
    finishButtonValue: PropTypes.string,
    additionalFrontendChangesEnabled: PropTypes.bool,
    saveDraftButtonValue: PropTypes.string,
};

Footer.defaultProps = {
    isSubmitDisabled: false,
    isDraftSubmitDisabled: false,
    useDraftDisruptions: false,
    isDraftOrCreateMode: true,
    onBack: null,
    onSubmitDraft: () => {},
    showFinishButton: false,
    isAddEffectsStep: false,
    isFinishDisabled: false,
    finishButtonValue: 'Finish',
    onFinish: () => {},
    additionalFrontendChangesEnabled: false,
    saveDraftButtonValue: 'Save draft',
};

export default connect(
    state => ({
        useDraftDisruptions: useDraftDisruptions(state),
        useAdditionalFrontendChanges: useAdditionalFrontendChanges(state),
    }),
    {
    },
)(Footer);
