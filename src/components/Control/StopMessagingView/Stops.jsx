import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import './Stops.scss';


class Stops extends React.Component {
    static propTypes = {
        stopMessage: PropTypes.object.isRequired,
        messageKey: PropTypes.string.isRequired,
    }

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
            if (_.has(stopsCollapseStatus, stopMessage.id)) {
                newStatus = !_.get(stopsCollapseStatus, stopMessage.id);
            }
            this.setState(prevState => ({
                stopsCollapseStatus: {
                    ...prevState.stopsCollapseStatus,
                    [stopMessage.id]: newStatus,
                },
            }));
        };

        if (_.isArray(stops)) {
            if (stops.length <= 5) {
                return stops.map(stop => stop.label).join(', ');
            }

            return (
                <Fragment>
                    <span>
                        {_.get(stopsCollapseStatus, stopMessage.id, true)
                            ? stops.slice(0, 5).map(stop => stop.label).join(', ')
                            : stops.map(stop => stop.label).join(', ')}
                    </span>
                    <button type="button" className="control-messaging-view__collapse-btn" onClick={ () => toggleCollapse() }>
                        {_.get(stopsCollapseStatus, stopMessage.id, true) ? '+' : '-'}
                    </button>
                </Fragment>
            );
        }
        return '';
    }
}

export default Stops;
