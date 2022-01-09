import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';

import './OffCanvasLayout.scss';

const allowedChildrenDisplayNames = [
    'Main',
    'Connect(SidePanel)',
    'Connect(SecondarySidePanel)',
];
export class OffCanvasLayout extends React.Component {
    static propTypes = {
        children: (props, propName, componentName) => { // eslint-disable-line react/require-default-props
            const prop = props[propName];
            let error = null;
            React.Children.forEach(prop, (child) => {
                const name = child.type.displayName || child.type.name;
                if (!name) {
                    error = new Error('SidePanel, SecondarySidePanel or Main are required');
                } else if (allowedChildrenDisplayNames.indexOf(name) === -1) {
                    error = new Error(`\`${componentName}\` children should be an element of type \`SidePanel\`, \`SecondarySidePanel\` or \`Main\`.`);
                }
            });
            return error;
        },
        onToggle: PropTypes.func,
    };

    static defaultProps = {
        onToggle: _.noop,
    };

    componentDidUpdate() { return this.props.onToggle(); }

    renderContent = childName => this.props.children.filter(child => child.type.displayName === childName || child.type.name === childName);

    render() {
        return (
            <section className="off-canvas-layout d-flex w-100 h-100">
                { this.renderContent('Connect(SidePanel)') }
                { this.renderContent('Main') }
                { this.renderContent('Connect(SecondarySidePanel)') }
            </section>
        );
    }
}

export default OffCanvasLayout;
