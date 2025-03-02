import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './CarsTooltipContent.scss';
import { FaPersonDigging, FaTriangleExclamation, FaUsersRectangle, FaImage } from 'react-icons/fa6';

const IconFromCategory = (props) => {
    const { category } = props;
    switch (category) {
    case 'Excavation':
        return <FaPersonDigging color="#D52923" className="cars-icon" />;
    case 'Non-Excavation':
        return <FaTriangleExclamation color="#D52923" className="cars-icon" />;
    case 'Event':
        return <FaUsersRectangle color="#D52923" className="cars-icon" />;
    default:
        return <FaImage color="#D52923" className="cars-icon" />;
    }
};

IconFromCategory.propTypes = {
    category: PropTypes.string.isRequired,
};

const formatDate = (date, format = 'DD/MM/YYYY') => {
    if (!date) return '-'; // Handle empty/null dates
    const formattedDate = moment(date);
    return formattedDate.isValid() ? formattedDate.format(format) : '-'; // Handle invalid dates
};

export function CarsTooltipContent({ properties }) {
    return (
        <>
            <div className="cars-header row mx-1">
                <div className="cars-icon-container">
                    <IconFromCategory category={ properties.WorksiteType } />
                </div>

                <h2 className="title mt-1">{properties.WorksiteType}</h2>
            </div>
            <div className="container">
                {/* Summary Part */}
                <div className="row mb-1">
                    <strong className="cars-summary-label">Organisation:</strong>
                    <span className="text-wrap">{` ${properties.PrincipalOrganisation}`}</span>
                </div>
                <div className="row mb-1">
                    <strong className="cars-summary-label">Project Name:</strong>
                    <span className="text-wrap">{` ${properties.ProjectName}`}</span>
                </div>
                <div className="row mb-4">
                    <strong className="cars-summary-label">Worksite Name:</strong>
                    <span className="text-wrap">{` ${properties.WorksiteName}`}</span>
                </div>
                {/* Detail Part */}
                <div className="row">
                    <div className="col m-0 p-2">
                        <strong>CAR ID Number</strong>
                        <div>{properties.WorksiteCode}</div>
                    </div>
                    <div className="col m-0 p-2">
                        <strong>CAR Status</strong>
                        <div>{properties.Status}</div>
                    </div>
                </div>
                <div className="row">
                    <div className="col m-0 p-2">
                        <strong>Worksite Type</strong>
                        <div>{properties.WorksiteType}</div>
                    </div>
                    <div className="col m-0 p-2">
                        <strong>Status Detail</strong>
                        <div>{properties.WorkStatus}</div>
                    </div>
                </div>
                <div className="row">
                    <div className="col m-0 p-2">
                        <strong>Project Start Date</strong>
                        <div>{formatDate(properties.ProjectStartDate)}</div>
                    </div>
                    <div className="col m-0 p-2">
                        <strong>Project End Date</strong>
                        <div>{formatDate(properties.ProjectEndDate)}</div>
                    </div>
                </div>
                <div className="row">
                    <div className="col m-0 p-2">
                        <strong>Work Start Date</strong>
                        <div>{formatDate(properties.WorkStartDate)}</div>
                    </div>
                    <div className="col m-0 p-2">
                        <strong>Work Completion Date</strong>
                        <div>{formatDate(properties.WorkCompletionDate)}</div>
                    </div>
                </div>
            </div>
        </>

    );
}

CarsTooltipContent.propTypes = {
    properties: PropTypes.object.isRequired,
};
