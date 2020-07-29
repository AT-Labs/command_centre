import React from 'react';
import PropTypes from 'prop-types';
import { ListGroupItem } from 'reactstrap';

class SelectItem extends React.Component {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        option: PropTypes.object.isRequired,
        checked: PropTypes.bool,
        onSelectionChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        checked: false,
    };

    constructor() {
        super();
        this.state = {
            mouseOver: false,
        };
    }

    handleMouseOver = () => {
        this.setState({ mouseOver: true });
    }

    handleMouseLeave = () => {
        this.setState({ mouseOver: false });
    }

    render() {
        return (
            <ListGroupItem
                className={ `${this.props.theme.suggestion} ${this.state.mouseOver ? this.props.theme.suggestionHovered : ''} border-0 rounded-0` }
                onMouseOver={ this.handleMouseOver }
                onMouseLeave={ this.handleMouseLeave }>
                <label htmlFor={ `checkbox_${this.props.option.value}` }>
                    <input type="checkbox"
                        id={ `checkbox_${this.props.option.value}` }
                        value={ this.props.option.value }
                        checked={ this.props.checked }
                        onChange={ this.props.onSelectionChange } />
                    {` ${this.props.option.label}`}
                </label>
            </ListGroupItem>
        );
    }
}

export default SelectItem;
