import React from 'react';
import PropTypes from 'prop-types';
import './Cluster.scss';
import Timeline from '../Timeline/Timeline';
import { systemCondition } from '../SystemCondition';

const Cluster = (props) => {
    let clusterConditionTimeLine;

    if (props.data.clusterCondition) {
        clusterConditionTimeLine = (
            <Timeline
                id={ props.data.clusterCondition.applicationId }
                key={ props.data.clusterCondition.applicationId }
                title={ props.data.clusterCondition.applicationName }
                description={ props.data.clusterCondition.description }
                data={ props.data.clusterCondition.periods }
            />
        );
    }

    return (
        <section className="cluster p-3 mb-2">
            <h1>{props.data.name}</h1>
            {clusterConditionTimeLine}

            {props.data.systemConditions.map(systemHealth => (
                <Timeline
                    id={ systemHealth.applicationId }
                    key={ systemHealth.applicationId }
                    title={ systemHealth.applicationName }
                    description={ systemHealth.description }
                    data={ systemHealth.periods }
                    indentDescription={ props.data.clusterCondition }
                />
            ))}
        </section>
    );
};

Cluster.propTypes = {
    data: PropTypes.objectOf({
        name: PropTypes.string.isRequired,
        clusterCondition: PropTypes.shape(systemCondition),
        systemConditions: PropTypes.arrayOf(systemCondition),
    }).isRequired,
};


export default Cluster;
