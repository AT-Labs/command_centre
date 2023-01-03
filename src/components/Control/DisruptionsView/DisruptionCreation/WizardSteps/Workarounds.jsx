import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isEditEnabled } from '../../../../../redux/selectors/control/disruptions';
import { toggleDisruptionModals, updateCurrentStep } from '../../../../../redux/actions/control/disruptions';
import Footer from './Footer';
import { WorkaroundsForm } from '../../Workaround/WorkaroundsForm';

export const Workarounds = (props) => {
    const onContinue = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(3);
            props.updateCurrentStep(1);
            props.onSubmit();
        } else {
            props.onSubmitUpdate();
        }
    };

    const onBack = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(1);
            props.updateCurrentStep(2);
        } else {
            props.onStepUpdate(0);
            props.updateCurrentStep(2);
        }
    };

    return (
        <div>
            <WorkaroundsForm disruption={ props.data } onDataUpdate={ props.onDataUpdate } />
            <Footer
                updateCurrentStep={ props.updateCurrentStep }
                onStepUpdate={ props.onStepUpdate }
                toggleDisruptionModals={ props.toggleDisruptionModals }
                isSubmitDisabled={ false }
                nextButtonValue={ props.isEditMode ? 'Save' : 'Finish' }
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
    onSubmitUpdate: PropTypes.func.isRequired,
    isEditMode: PropTypes.bool,
};

Workarounds.defaultProps = {
    data: {},
    onStepUpdate: () => { /**/ },
    onDataUpdate: () => { /**/ },
    onSubmit: () => { /**/ },
    updateCurrentStep: () => { /**/ },
    isEditMode: false,
};

export default connect(state => ({
    isEditMode: isEditEnabled(state),
}), { toggleDisruptionModals, updateCurrentStep })(Workarounds);
