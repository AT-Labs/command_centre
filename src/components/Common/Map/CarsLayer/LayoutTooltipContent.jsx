import React from 'react';
import PropTypes from 'prop-types';

import './LayoutTooltipContent.scss';
import { JURISDICTION_MAPPINGS } from '../../../../constants/cars';

export function LayoutTooltipContent({ deployments }) {
    return (
        <div className="container layout-tooltip-container">
            {deployments.map((deployment, index) => {
                const {
                    tmpCode,
                    jurisdictionId,
                    tmpDescription,
                    layoutDescription,
                    stmsName,
                    stmsMobile,
                    stmsUserId,
                    contractor,
                    worksiteAddress,
                    layoutCode,
                    startDate,
                    endDate,
                } = deployment;

                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={ index } className="border border-2 p-2 my-4">
                        <div className="row mb-1">
                            <div className="col">
                                <strong>TMP Code: </strong>
                            </div>
                            <div className="col">
                                <span className="text-wrap">{tmpCode}</span>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col">
                                <strong>Layout Code: </strong>
                            </div>
                            <div className="col">
                                <span className="text-wrap">{layoutCode}</span>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col">
                                <strong>Location: </strong>
                            </div>
                            <div className="col">
                                <span className="text-wrap">{worksiteAddress}</span>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col">
                                <strong>Date(start/end): </strong>
                            </div>
                            <div className="col">
                                <span className="text-wrap">
                                    {startDate}
                                    {' '}
                                    /
                                    {' '}
                                    {endDate}
                                </span>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col">
                                <strong>Juridiction ID: </strong>
                            </div>
                            <div className="col">
                                <span className="text-wrap">
                                    {JURISDICTION_MAPPINGS[jurisdictionId]}
                                </span>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col">
                                <strong>Description: </strong>
                            </div>
                            <div className="col">
                                <span className="text-wrap">
                                    {layoutDescription || tmpDescription}
                                </span>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col">
                                <strong>Contact: </strong>
                            </div>
                            <div className="col">
                                <span className="text-wrap">
                                    {stmsName}
                                    {' '}
                                    -
                                    {' '}
                                    {stmsMobile}
                                </span>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col">
                                <strong>Contractor: </strong>
                            </div>
                            <div className="col">
                                <span className="text-wrap">
                                    {contractor}
                                    {' '}
                                    -
                                    {' '}
                                    {stmsUserId}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

LayoutTooltipContent.propTypes = {
    deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
};
