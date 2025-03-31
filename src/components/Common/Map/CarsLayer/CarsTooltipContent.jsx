import React from 'react';
import PropTypes from 'prop-types';
import './CarsTooltipContent.scss';
import { formatDate } from '../../../../utils/cars';
import { getIconFromCategory } from './CarsDetails';

export function CarsTooltipContent({ properties }) {
    return (
        <>
            <div className="cars-header row mx-1">
                <div className="cars-icon-container">
                    { getIconFromCategory(properties.WorksiteType) }
                </div>

                <h2 className="title mt-1">{properties.WorksiteType}</h2>
            </div>
            <div className="container">
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
