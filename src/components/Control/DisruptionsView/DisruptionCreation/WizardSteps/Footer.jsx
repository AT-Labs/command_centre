import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { useDraftDisruptions, useAdditionalFrontendChanges } from '../../../../../redux/selectors/appSettings';
import { getColumnClass, getFooterClassName, getCancelButtonClassName } from '../../../../../utils/common/footer-utils';

export const Footer = props => (
    <footer className={ getFooterClassName(props) }>
        <div className={ getColumnClass(props, '') }>
            { props.onBack && (
                <Button
                    className="btn cc-btn-link"
                    onClick={ props.onBack }>
                    Go back
                </Button>
            )}
        </div>
        <div className={ getColumnClass(props, ' pl-0') }>
            <Button
                className={ getCancelButtonClassName(props) }
                onClick={ () => {
                    props.toggleModals('isCancellationOpen', true);
                } }>
                Cancel
            </Button>
        </div>
        { (props.useDraftDisruptions && props.isDraftOrCreateMode) && (
            <div className={ getColumnClass(props, ' pl-0') }>
                <Button
                    className="btn cc-btn-secondary btn-block"
                    disabled={ props.isDraftSubmitDisabled }
                    onClick={ props.onSubmitDraft }>
                    Save draft
                </Button>
            </div>
        )}
        <div className={ getColumnClass(props, props.useDraftDisruptions && props.isDraftOrCreateMode ? ' pl-0' : '') }>
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

Footer.propTypes = {
    toggleModals: PropTypes.func.isRequired,
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
        useAdditionalFrontendChanges: useAdditionalFrontendChanges(state),
    }),
    {
    },
)(Footer);
