import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import { deallocateVehiclesFromAllTripsInBlock, deallocateVehiclesFromTripSelectedOnwards, substituteVehicles }
    from '../../../../redux/actions/control/blocks';
import { getAllBlocks, getAllTrainsWithAssignedBlocks } from '../../../../redux/selectors/control/blocks';
import { getVehiclesFromBlockTrips } from '../../../../utils/control/blocks';
import { styleAssignedTrains } from '../../../../utils/control/trains';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ConfirmationModalBody from '../../Common/ConfirmationModal/ConfirmationModalBody';
import ControlSearch from '../../Common/ControlSearch/ControlSearch';
import SearchCombo from '../../Common/SearchCombo/SearchCombo';
import { BlockType } from '../types';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';

class EditVehiclesModal extends React.Component {
    static propTypes = {
        block: BlockType.isRequired,
        substituteVehicles: PropTypes.func.isRequired,
        deallocateVehiclesFromTripSelectedOnwards: PropTypes.func.isRequired,
        deallocateVehiclesFromAllTripsInBlock: PropTypes.func.isRequired,
        assignedTrains: PropTypes.array.isRequired,
        setModalState: PropTypes.func,
    };

    static defaultProps = {
        setModalState: () => {},
    };

    constructor(props) {
        super(props);

        this.state = {
            vehicles: null,
            tripSelected: null,
            isPopulated: false,
            isModalOpen: false,
            isSubstitute: true,
            isDeallocateCheckboxActive: false,
        };

        this.MODALS_INFO = {
            SUBSTITUTE: {
                title: 'Change vehicles',
                label: 'Change vehicle',

            },
            DEALLOCATE: {
                title: 'Deallocate vehicles',
                label: 'Deallocate vehicles',
                message: () => `Are you sure you want to deallocate vehicle/s ${this.state.vehicles && this.state.vehicles.map(vehicle => vehicle.label).join(' ,')} from block ${this.props.block.operationalBlockId}?`,
            },
        };
    }

    onVehicleSelection = (isPopulated, vehicles) => this.setState({
        vehicles,
        isPopulated,
    });

    onTripSelection = (tripSelected) => {
        this.setState({
            tripSelected,
        });
    };

    onTripInputValueChange = () => this.setState({
        tripSelected: null,
    });

    getSubtitle = () => {
        const { block: { operationalBlockId } } = this.props;
        return (
            <dl className="row">
                <dt className="col-6">Block number</dt>
                <dd className="col-6">{ operationalBlockId }</dd>
                <dt className="col-6">Current vehicle</dt>
                <dd className="col-6">{ this.getBlockVehicleMappings().join(', ') }</dd>
            </dl>
        );
    };

    allocateVehicles = () => {
        const { tripSelected, vehicles } = this.state;
        const { block } = this.props;
        this.props.substituteVehicles(block, Array.from(vehicles.values()), tripSelected.externalRef);
        this.toggleModal();
    };

    deallocateVehicles = () => {
        const { block } = this.props;
        const { vehicles, tripSelected } = this.state;
        if (tripSelected) this.props.deallocateVehiclesFromTripSelectedOnwards(block, tripSelected.externalRef);
        else this.props.deallocateVehiclesFromAllTripsInBlock(block, vehicles);
        this.toggleModal();
    };

    toggleModal = (isSubstitute) => {
        this.setState(
            prevState => ({
                isModalOpen: !prevState.isModalOpen,
                vehicles: null,
                tripSelected: null,
                isSubstitute,
            }),
            () => this.props.setModalState(this.state.isModalOpen),
        );
    };

    getBlockVehicleMappings = (renderToggleButtonFunc) => {
        const blockVehicleMappings = getVehiclesFromBlockTrips(this.props.block);
        return _.map(blockVehicleMappings, vehicle => (renderToggleButtonFunc ? renderToggleButtonFunc(vehicle) : vehicle.buttonLabel));
    };

    getVehiclesFromBlock = () => _.uniqBy(_.compact(
        _.flatten(
            this.props.block.operationalTrips
                .map(trip => (
                    trip.status !== TRIP_STATUS_TYPES.completed && trip.status !== TRIP_STATUS_TYPES.inProgress
                        ? trip.vehicles
                        : null)),
        ),
    ), 'id');

    renderModalToggleButton = () => {
        const renderToggleButton = (blockVehicleMapping) => {
            const { buttonLabel, vehicles } = blockVehicleMapping;
            const blockVehicles = this.getVehiclesFromBlock();
            const notCompletedTripsVehicles = !_.isEmpty(blockVehicles) && _.compact(vehicles.map(vehicle => _.find(blockVehicles, { id: vehicle.id })));
            const isNotCompletedTripsVehiclesEmpty = _.isEmpty(notCompletedTripsVehicles);

            return (
                <div key={ buttonLabel } className="mr-4">
                    <Button
                        className="edit-vehicles-modal__toggle cc-btn-link ml-1"
                        onClick={ () => this.toggleModal(true) }>
                        { buttonLabel }
                    </Button>
                    {!isNotCompletedTripsVehiclesEmpty
                        && (
                            <Button
                                className="cc-btn-remove cc-btn-remove--sm p-0 mt-1 text-at-ocean-tint-10 rounded-circle"
                                color="secondary"
                                tabIndex="0"
                                aria-label={ `Remove vehicle ${buttonLabel}` }
                                onClick={ () => {
                                    this.toggleModal(false);
                                    this.setState({ vehicles });
                                } }>
                                <span>&times;</span>
                            </Button>
                        )}
                </div>
            );
        };

        return (
            <div className="row">
                { this.getBlockVehicleMappings(renderToggleButton) }
            </div>
        );
    };

    renderSubstituteView = () => (
        <>
            <FormGroup check className="pt-1 pb-4">
                <Label for="deallocate-from-trip-checkbox" check>
                    <Input
                        id="deallocate-from-trip-checkbox"
                        type="checkbox"
                        onClick={ () => this.setState(prevState => ({
                            isDeallocateCheckboxActive: !prevState.isDeallocateCheckboxActive,
                        })) } />
                    Deallocate vehicles
                </Label>
            </FormGroup>
            {
                !this.state.isDeallocateCheckboxActive && (
                    <SearchCombo
                        data={ styleAssignedTrains(this.props.assignedTrains) }
                        pathToProperty="label"
                        label="New Vehicles"
                        focusInputBackOnClickOut
                        addButtonLabel="Add new vehicle"
                        pathToEditedPropForSuggestion="labelWithAllocatedBlocks"
                        placeholder="Select vehicle"
                        onSelection={ this.onVehicleSelection } />
                )
            }
            <ControlSearch
                id="search-trip"
                inputId="search-trip-input"
                focusInputBackOnClickOut
                label="Select trip:"
                data={ _.compact(this.props.block.operationalTrips.map(trip => trip.status !== TRIP_STATUS_TYPES.completed && ({
                    ...trip,
                    customLabel: `${trip.externalRef} - ${trip.routeLongName}`,
                }))) }
                pathToProperty="customLabel"
                placeholder="Select trip"
                onInputValueChange={ this.onTripInputValueChange }
                onSelection={ tripSelectedParam => this.onTripSelection(tripSelectedParam) } />
        </>
    );

    renderDeallocateView = () => <ConfirmationModalBody message={ this.MODALS_INFO.DEALLOCATE.message() } />;

    render() {
        const { vehicles, isPopulated, tripSelected, isModalOpen, isSubstitute, isDeallocateCheckboxActive } = this.state;
        const okButtonWhensSubstitute = isDeallocateCheckboxActive ? this.deallocateVehicles : this.allocateVehicles;
        const shouldOkButtonBeDisableWhenSubstitute = isDeallocateCheckboxActive
            ? _.isEmpty(tripSelected)
            : (_.isNull(vehicles) || !isPopulated) || _.isEmpty(tripSelected);

        return (
            <CustomModal
                className="edit-vehicles-modal"
                title={ isSubstitute ? this.MODALS_INFO.SUBSTITUTE.title : this.MODALS_INFO.DEALLOCATE.title }
                renderToggleButton={ this.renderModalToggleButton }
                isModalOpen={ isModalOpen }
                onClose={ this.toggleModal }
                okButton={ {
                    label: isSubstitute ? this.MODALS_INFO.SUBSTITUTE.label : this.MODALS_INFO.DEALLOCATE.label,
                    onClick: isSubstitute ? okButtonWhensSubstitute : this.deallocateVehicles,
                    isDisabled: isSubstitute ? shouldOkButtonBeDisableWhenSubstitute : false,
                    className: 'edit-vehicles-modal__save-btn',
                } }>
                { isSubstitute && this.getSubtitle() }
                { isSubstitute ? this.renderSubstituteView() : this.renderDeallocateView() }
            </CustomModal>
        );
    }
}

export default connect(
    state => ({
        blocks: getAllBlocks(state),
        assignedTrains: getAllTrainsWithAssignedBlocks(state),
    }),
    { substituteVehicles, deallocateVehiclesFromTripSelectedOnwards, deallocateVehiclesFromAllTripsInBlock },
)(EditVehiclesModal);
