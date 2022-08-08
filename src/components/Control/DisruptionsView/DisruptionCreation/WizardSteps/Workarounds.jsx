import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { toggleDisruptionModals, updateCurrentStep } from '../../../../../redux/actions/control/disruptions';
import Footer from './Footer';
import { WorkaroundsForm } from '../../Workaround/WorkaroundsForm';

export const Workarounds = (props) => {
    const onContinue = () => {
        props.onStepUpdate(3);
        props.updateCurrentStep(1);
        props.onSubmit();
    };

    const onBack = () => {
        props.onStepUpdate(1);
        props.updateCurrentStep(2);
    };

    return (
        <div>
            <WorkaroundsForm disruption={ props.data } onDataUpdate={ props.onDataUpdate } />
            <Footer
                updateCurrentStep={ props.updateCurrentStep }
                onStepUpdate={ props.onStepUpdate }
                toggleDisruptionModals={ props.toggleDisruptionModals }
                isSubmitDisabled={ false }
                nextButtonValue="Finish"
                onContinue={ () => onContinue() }
                onBack={ () => onBack() } />
        </div>
    );
};

Workarounds.propTypes = {
    data: PropTypes.object,
    onStepUpdate: PropTypes.func,
    onDataUpdate: PropTypes.func,
    onSubmit: PropTypes.func,
    toggleDisruptionModals: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func,
};

Workarounds.defaultProps = {
    data: {},
    onStepUpdate: () => { /**/ },
    onDataUpdate: () => { /**/ },
    onSubmit: () => { /**/ },
    updateCurrentStep: () => { /**/ },
};

export default connect(null, { toggleDisruptionModals, updateCurrentStep })(Workarounds);
