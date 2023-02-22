import React from 'react';
import PropTypes from 'prop-types';
import { isArray, has, get } from 'lodash-es';
import './Stops.scss';

class Stops extends React.Component {
    static propTypes = {
        stopMessage: PropTypes.object.isRequired,
        messageKey: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            stopsCollapseStatus: {},
        };
    }

    render() {
        const { stopMessage, messageKey } = this.props;
        const { stopsCollapseStatus } = this.state;

        const stops = stopMessage[messageKey];

        const toggleCollapse = () => {
            let newStatus = false;
            if (has(stopsCollapseStatus, stopMessage.id)) {
                newStatus = !get(stopsCollapseStatus, stopMessage.id);
            }
            this.setState(prevState => ({
                stopsCollapseStatus: {
                    ...prevState.stopsCollapseStatus,
                    [stopMessage.id]: newStatus,
                },
            }));
        };

        if (isArray(stops)) {
            if (stops.length <= 5) {
                return stops.map(stop => stop.label).join(', ');
            }

            return (
                <>
                    <span>
                        {get(stopsCollapseStatus, stopMessage.id, true)
                            ? stops.slice(0, 5).map(stop => stop.label).join(', ')
                            : stops.map(stop => stop.label).join(', ')}
                    </span>
                    <button type="button" className="control-messaging-view__collapse-btn" onClick={ () => toggleCollapse() }>
                        {get(stopsCollapseStatus, stopMessage.id, true) ? '+' : '-'}
                    </button>
                </>
            );
        }
        return '';
    }
}

export default Stops;
