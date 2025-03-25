import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Wizard extends Component {
    static propTypes = {
        className: PropTypes.string,
        data: PropTypes.object,
        response: PropTypes.object,
        onSubmit: PropTypes.func.isRequired,
        onSubmitDraft: PropTypes.func,
        onStepUpdate: PropTypes.func,
        onDataUpdate: PropTypes.func,
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.node),
            PropTypes.node,
        ]).isRequired,
    };

    static defaultProps = {
        className: '',
        data: {},
        response: {},
        onStepUpdate: () => {},
        onDataUpdate: () => {},
        onSubmitDraft: () => {},
    };

    constructor(props) {
        super(props);

        this.state = {
            activeStep: 0,
            prevStep: null,
        };
    }

    onStepUpdate = (activeStep) => {
        this.setState(
            prevState => ({
                activeStep,
                prevStep: prevState.activeStep,
            }),
            () => this.props.onStepUpdate(this.state.activeStep),
        );
    };

    render() {
        const { data, response, onSubmit, onSubmitDraft } = this.props;
        const { activeStep, prevStep } = this.state;
        const childrenWithProps = React.Children.map(this.props.children.filter(child => !!child), child => React.cloneElement(
            child,
            {
                data,
                response,
                onSubmit,
                onSubmitDraft,
                activeStep,
                prevStep,
                onStepUpdate: nextStep => this.onStepUpdate(nextStep),
                onDataUpdate: (wizard, key, value) => this.props.onDataUpdate(wizard, key, value),
            },
        ));

        return (
            <section className={ `${this.props.className} wizard container` }>
                { childrenWithProps[this.state.activeStep] }
            </section>
        );
    }
}
