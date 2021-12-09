import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

const Footer = props => (
    <footer className="row m-0 justify-content-between p-4 position-fixed">
        <div className="col-4">
            { props.onBack && (
                <Button
                    className="btn cc-btn-link"
                    onClick={ props.onBack }>
                    Go back
                </Button>
            )}
        </div>
        <div className="col-4 pl-0">
            <Button
                className="btn cc-btn-secondary btn-block pl-0"
                onClick={ () => {
                    props.toggleDisruptionModals('isCancellationOpen', true);
                } }>
                Cancel
            </Button>
        </div>
        <div className="col-4">
            <Button
                disabled={ props.isSubmitEnabled }
                className="btn cc-btn-primary btn-block continue"
                onClick={ props.onContinue }>
                { props.nextButtonValue }
            </Button>
        </div>
    </footer>
);

Footer.propTypes = {
    toggleDisruptionModals: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onBack: PropTypes.func,
    isSubmitEnabled: PropTypes.bool,
    nextButtonValue: PropTypes.string.isRequired,
};

Footer.defaultProps = {
    isSubmitEnabled: false,
    onBack: null,
};

export default Footer;
