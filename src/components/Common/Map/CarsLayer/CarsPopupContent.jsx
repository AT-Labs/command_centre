import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export function CarsPopupContent({ properties }) {
    return (
        <div>
            <div className="row">
                <div className="col pb-2">
                    <b>CAR ID Number:</b>
                    {' '}
                    {properties.WorksiteCode}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Organisation:</b>
                    {' '}
                    {properties.PrincipalOrganisation}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Project Name:</b>
                    {' '}
                    {properties.ProjectName}
                </div>
            </div>

            <div className="row">
                <div className="col pb-2">
                    <b>Worksite Name:</b>
                    {' '}
                    {properties.WorksiteName}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>CAR Status:</b>
                    {' '}
                    {properties.Status}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Status Detail:</b>
                    {' '}
                    {properties.WorkStatus}
                </div>
            </div>

            <div className="row">
                <div className="col pb-2">
                    <b>Worksite Type:</b>
                    {' '}
                    {properties.WorksiteType}
                </div>
            </div>

            <div className="row">
                <div className="col pb-2">
                    <b>Project Start Date:</b>
                    {' '}
                    {moment(properties.ProjectStartDate).format('DD-MM-YYYY')}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Project End Date:</b>
                    {' '}
                    {moment(properties.ProjectEndDate).format('DD-MM-YYYY')}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Work Start Date:</b>
                    {' '}
                    {moment(properties.WorkStartDate).format('DD-MM-YYYY')}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Work Completion Date:</b>
                    {' '}
                    {properties.WorkCompletionDate ? moment(properties.WorkCompletionDate).format('DD-MM-YYYY') : 'N/A'}
                </div>
            </div>
        </div>
    );
}

CarsPopupContent.propTypes = {
    properties: PropTypes.object.isRequired,
};
