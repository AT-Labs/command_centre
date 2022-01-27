import React from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';

import './Timeline.scss';
import moment from 'moment';
import { systemCondition } from '../SystemCondition';

const Timeline = (props) => {
    const { data } = props;
    return (
        <div className="row no-gutters dashboard-timeline border-at-ocean-tint-20 p-3">
            <div className={ `col-3${props.indentDescription ? ' pl-5' : ''}` }>
                <h4 className="mb-1">{props.title}</h4>
                {props.description && <p className="m-0">{props.description}</p>}
            </div>
            <div className="col-9 align-self-center">
                <div className="d-flex">
                    {data.map(item => (
                        <div
                            key={ item.id }
                            id={ `timeline-${props.id}-${item.id}` }
                            style={ { width: `${(item.duration / (24 * 60 * 60)) * 100}%`, height: '20px' } }
                            className={ `${item.isUp ? 'bg-at-shore-tint-50' : 'bg-at-red-tint-80'}` }
                        />
                    ))}
                    <div style={ { width: '1px', height: '25px' } } className="bg-at-shore" />
                </div>
                <div className="text-right text-at-shore-tint-80 font-size-sm">Current time</div>
                {data.map(item => !item.isUp && (
                    <UncontrolledTooltip
                        key={ item.id }
                        hideArrow
                        placement="bottom"
                        target={ `timeline-${props.id}-${item.id}` }
                        className="dashboard-timeline__tooltip"
                    >
                        {moment(item.start).format('HH:mm')}
                        {' '}
                        -
                        {moment(item.end).format('HH:mm')}
                    </UncontrolledTooltip>
                ))}
            </div>
        </div>
    );
};

Timeline.propTypes = {
    // eslint-disable-next-line
    indentDescription: PropTypes.boolean,
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    data: PropTypes.arrayOf(systemCondition).isRequired,
};

Timeline.defaultProps = {
    description: '',
    indentDescription: false,
};

export default Timeline;
