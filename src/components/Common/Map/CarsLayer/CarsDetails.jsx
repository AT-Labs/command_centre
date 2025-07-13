import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input, Label } from 'reactstrap';
import { FaPersonDigging, FaTriangleExclamation, FaUsersRectangle, FaImage } from 'react-icons/fa6';
import { LuX } from 'react-icons/lu';

import Loader from '../../Loader/Loader';
import { getWorksite, getLayout } from '../../../../utils/transmitters/cars-api';
import { formatDate, checkCarActivation } from '../../../../utils/cars';
import { JURISDICTION_MAPPINGS } from '../../../../constants/cars';

import './CarsDetails.scss';

const iconMapping = {
    Excavation: <FaPersonDigging color="#D52923" className="cars-icon" />,
    'Non-Excavation': <FaTriangleExclamation color="#D52923" className="cars-icon" />,
    Event: <FaUsersRectangle color="#D52923" className="cars-icon" />,
};

export const getIconFromCategory = category => iconMapping[category] || <FaImage color="#D52923" className="cars-icon" />;

const DetailRow = ({ label, value }) => (
    <div className="col m-0 p-2">
        <strong>{label}</strong>
        <div>{value}</div>
    </div>
);

DetailRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node.isRequired,
};

const CarsDetails = ({ cars, onClose, onUpdateImpacts, filterByYesterdayTodayTomomorrowDate }) => {
    const [allWorksite, setAllWorksite] = useState(null);
    const [allLayout, setAllLayout] = useState([]);

    const [isTMPLoading, setIsTMPLoading] = useState(true);
    const [isLayoutLoading, setIsLayoutLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [selectedTMP, setSelectedTMP] = useState('all');
    const [filteredLayout, setFilteredLayout] = useState([]);
    const [selectedLayout, setSelectedLayout] = useState('all');

    const { properties } = cars;

    const enrichImpacts = impacts => impacts.map((impact) => {
        let enrichDeployment = null;
        const layout = allLayout.find(l => l.id === impact.layoutId);
        if (layout) {
            enrichDeployment = layout.deployments;
        }

        return { ...impact, deployments: enrichDeployment };
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsTMPLoading(true);
            try {
                const worksiteResponse = (await getWorksite(cars.properties.WorksiteCode, filterByYesterdayTodayTomomorrowDate)) || [];
                setAllWorksite(worksiteResponse);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsTMPLoading(false);
            }
        };
        if (cars) fetchData();
    }, [cars]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLayoutLoading(true);
            try {
                const ids = allWorksite?.tmps.map(tmp => tmp.tmpId);
                const layoutResponse = (await getLayout(ids.join(), filterByYesterdayTodayTomomorrowDate)) || [];
                setAllLayout(layoutResponse);
                setFilteredLayout(layoutResponse);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLayoutLoading(false);
            }
        };
        if (allWorksite) fetchData();
    }, [allWorksite]);

    useEffect(() => {
        if (selectedTMP !== 'all') {
            const filteredData = allLayout.filter(
                layout => layout.tmpId === Number(selectedTMP),
            );
            setFilteredLayout(filteredData);
        } else {
            setFilteredLayout(allLayout);
        }
        setSelectedLayout('all');
    }, [selectedTMP]);

    useEffect(() => {
        const impacts = filteredLayout
            .filter(
                layout => selectedLayout === 'all' || selectedLayout === layout.id,
            )
            .flatMap(layout => layout.impacts);

        onUpdateImpacts(enrichImpacts(impacts));
    }, [filteredLayout, selectedLayout]);

    useEffect(() => {
        let impacts = [];
        if (selectedLayout === 'all') {
            impacts = allLayout
                .filter(l => l.tmpId === Number(selectedTMP))
                .flatMap(l => l.impacts);
        } else if (selectedLayout !== 'all') {
            const layout = allLayout.find(
                l => l.id === Number(selectedLayout),
            );
            if (layout) {
                impacts = layout.impacts;
            }
        }
        onUpdateImpacts(enrichImpacts(impacts));
    }, [selectedLayout, selectedTMP, allLayout]);

    return (
        <div className="cars-details-container position-fixed d-flex flex-column">
            <div className="cars-header">
                <div className="d-flex flex-row">
                    <div className="cars-icon-container">
                        {getIconFromCategory(properties.WorksiteType)}
                    </div>
                    <h2 className="title mt-1">{properties.WorksiteType}</h2>
                </div>
                <LuX
                    data-testid="close-cars-details"
                    color="#3f9db5"
                    size={ 28 }
                    onClick={ onClose }
                    style={ { cursor: 'pointer' } }
                />
            </div>
            <div className="container">
                <div className="p-2">
                    <div className="row mb-1">
                        <strong className="cars-summary-label">
                            Organisation:
                        </strong>
                        <span className="text-wrap">{` ${properties.PrincipalOrganisation}`}</span>
                    </div>
                    <div className="row mb-1">
                        <strong className="cars-summary-label">
                            Project Name:
                        </strong>
                        <span className="text-wrap">{` ${properties.ProjectName}`}</span>
                    </div>
                    <div className="row mb-4">
                        <strong className="cars-summary-label">
                            Worksite Name:
                        </strong>
                        <span className="text-wrap">{` ${properties.WorksiteName}`}</span>
                    </div>
                </div>
                <div className="row">
                    <DetailRow key="card-id-number" label="CAR ID Number" value={ properties.WorksiteCode } />
                    <DetailRow key="card-status" label="CAR Status" value={ properties.Status } />
                </div>
                <div className="row">
                    <DetailRow key="card-id-number" label="Worksite Type" value={ properties.WorksiteType } />
                    <DetailRow key="card-status" label="Status Detail" value={ properties.WorkStatus } />
                </div>
                <div className="row">
                    <DetailRow key="card-id-number" label="Project Start Date" value={ formatDate(properties.ProjectStartDate) } />
                    <DetailRow key="card-status" label="Project End Date" value={ formatDate(properties.ProjectEndDate) } />
                </div>
                <div className="row">
                    <DetailRow key="card-id-number" label="Work Start Date" value={ formatDate(properties.WorkStartDate) } />
                    <DetailRow key="card-status" label="Work Completion Date" value={ formatDate(properties.WorkCompletionDate) } />
                </div>

                <div className="row">
                    <div className="col m-0 p-2">
                        <strong>Company details: </strong>
                        <div>{allWorksite ? allWorksite.clientName : '-'}</div>
                    </div>
                    <div className="col m-0 p-2">
                        <strong>Project Manager:</strong>
                        <div>
                            { allWorksite ? (
                                <>
                                    <div>{allWorksite.applicantName}</div>
                                    <div>{allWorksite.applicantOrganization}</div>
                                    <div>{allWorksite.applicantContact}</div>
                                    <div>{allWorksite.principalName}</div>
                                    <div>{allWorksite.principalOrganization}</div>
                                    <div>{allWorksite.principalContact}</div>
                                </>
                            ) : '-' }
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col m-0 p-2">
                        <strong>RCA:</strong>
                        <div>{allWorksite ? JURISDICTION_MAPPINGS[allWorksite?.jurisdictionId] : '-'}</div>
                    </div>
                    <div className="col m-0 p-2">
                        <strong>Status: </strong>
                        <div>{ allWorksite ? checkCarActivation(allWorksite.workStartDate, allWorksite.workEndDate) : '-' }</div>
                    </div>
                </div>
            </div>
            <div>
                {!isTMPLoading && allWorksite && allWorksite.tmps && allWorksite.tmps.length > 0 && (
                    <FormGroup>
                        <Label for="select-tmp">
                            <span className="font-size-md font-weight-bold">
                                Available TMPs
                            </span>
                        </Label>
                        <Input
                            type="select"
                            className="w-100 border border-dark position-relative"
                            disabled={ false }
                            id="select-tmp"
                            value={ selectedTMP }
                            defaultValue="all"
                            onChange={ e => setSelectedTMP(e.currentTarget.value) }
                        >
                            <option key="all" value="all">
                                TMP (All)
                            </option>
                            {allWorksite?.tmps?.map(item => (
                                <option
                                    id={ item.Id }
                                    key={ item.Id }
                                    value={ item.tmpId }
                                >
                                    {item.tmpCode}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>
                )}

                {!isTMPLoading && allWorksite && (!allWorksite.tmps || allWorksite.tmps.length === 0) && (
                    <div className="alert alert-warning" role="alert">
                        No TMPs valid for the selected date range.
                    </div>
                )}

                {!isLayoutLoading && (
                    <FormGroup className="">
                        <Label for="select-layout">
                            <span className="font-size-md font-weight-bold">
                                Layout
                            </span>
                        </Label>
                        <Input
                            type="select"
                            className="w-100 border border-dark position-relative"
                            id="select-layout"
                            value={ selectedLayout }
                            defaultValue="all"
                            disabled={ selectedTMP === 'all' }
                            onChange={ e => setSelectedLayout(e.currentTarget.value) }
                        >
                            <option key="all" value="all">
                                Layout (All)
                            </option>
                            {filteredLayout.map(item => (
                                <option
                                    id={ item.id }
                                    key={ item.id }
                                    value={ item.id }
                                >
                                    {item.layoutCode}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>
                )}
                {!errorMessage && (isTMPLoading || isLayoutLoading) && (
                    <div className="cc-standard-loader-container">
                        <div className="cc-standard-loader-wrapper d-flex flex-column justify-content-center align-items-center">
                            <Loader ariaLabel="Loading addresses" />
                            <span className="mt-4">
                                Loading additional information...
                            </span>
                        </div>
                    </div>
                )}
                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

CarsDetails.propTypes = {
    cars: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onUpdateImpacts: PropTypes.func.isRequired,
    filterByYesterdayTodayTomomorrowDate: PropTypes.bool,
};

CarsDetails.defaultProps = {
    filterByYesterdayTodayTomomorrowDate: false,
};

export default CarsDetails;
