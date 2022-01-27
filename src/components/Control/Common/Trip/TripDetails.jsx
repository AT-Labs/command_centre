import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';

const TripDetails = ({ data }) => {
    if (!data || !data.length) return null;

    const getRows = rows => rows.map(row => (
        <React.Fragment key={ _.kebabCase(row.name) }>
            <dt className="col-6 text-right text-nowrap">
                {row.name}
                :
            </dt>
            <dd
                className="col-6 text-left"
                id={ `trip-detail-${_.kebabCase(row.name)}` }
                data-value={ row.value }
            >
                {row.value}
            </dd>
        </React.Fragment>
    ));

    const getColumns = columns => columns.map(column => (
        <div className="col" key={ _.kebabCase(column[0].name) }>
            <dl className="row m-0">
                { getRows(column) }
            </dl>
        </div>
    ));

    return (
        <section className="container-fluid pt-4 pb-3">
            <div className="row">
                { getColumns(data) }
            </div>
        </section>
    );
};

TripDetails.propTypes = {
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
    }))).isRequired,
};

export default TripDetails;
