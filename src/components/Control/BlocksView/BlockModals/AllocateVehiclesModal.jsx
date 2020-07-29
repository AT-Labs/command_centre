import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { allocateVehicles } from '../../../../redux/actions/control/blocks';
import { getAllBlocks, getAllTrainsWithAssignedBlocks } from '../../../../redux/selectors/control/blocks';
import { getOverlappingTrips } from '../../../../utils/control/blocks';
import { styleAssignedTrains } from '../../../../utils/control/trains';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import SearchCombo from '../../Common/SearchCombo/SearchCombo';
import { BlockType, TripType } from '../types';
import OverlappingTripsAlert from './OverlappingTripsAlert';

export class AllocateVehiclesModal extends React.Component {
    static propTypes = {
        allocateVehicles: PropTypes.func.isRequired,
        assignedTrains: PropTypes.array.isRequired,
        block: BlockType.isRequired,
        blocks: PropTypes.arrayOf(BlockType).isRequired,
        buttonLabel: PropTypes.string,
        openModalButtonClass: PropTypes.string,
        selectedTrips: PropTypes.arrayOf(TripType),
        disable: PropTypes.bool,
        setModalState: PropTypes.func,
    }

    static defaultProps = {
        buttonLabel: '',
        disable: false,
        openModalButtonClass: '',
        selectedTrips: [],
        setModalState: () => {},
    }

    constructor() {
        super();

        this.state = {
            vehicles: null,
            isPopulated: false,
            overlappingTrips: {},
            isModalOpen: false,
        };
    }

    onSelection = (isPopulated, vehicles) => this.setState({
        vehicles,
        isPopulated,
        overlappingTrips: {},
    }, () => this.state.vehicles && this.getOverlappingTrips())

    getOverlappingTrips = () => {
        const { blocks, block, selectedTrips } = this.props;
        const selectedVehicles = Array.from(this.state.vehicles.values());
        const overlappingTrips = getOverlappingTrips(blocks, block, selectedVehicles, selectedTrips);
        if (!_.isEmpty(overlappingTrips)) this.setState({ overlappingTrips });
    }

    allocateVehicles = () => {
        const selectedVehicles = Array.from(this.state.vehicles.values());
        this.props.allocateVehicles(this.props.block, selectedVehicles, this.props.selectedTrips);
        this.toggleModal();
    }

    toggleModal = () => {
        this.setState(prevState => ({
            isModalOpen: !prevState.isModalOpen,
            vehicles: null,
            overlappingTrips: {},
        }),
        () => this.props.setModalState(this.state.isModalOpen));
    }

    renderModalToggleButton = () => (
        <Button
            className={
                this.props.openModalButtonClass
                    ? this.props.openModalButtonClass
                    : 'allocate-vehicles-modal__toggle border-0 bg-at-shore-tint-30 text-primary'
            }
            color="transparent"
            disabled={ this.props.disable }
            onClick={ this.toggleModal }>
            { this.props.buttonLabel ? this.props.buttonLabel : 'Allocate vehicles' }
        </Button>
    )

    render() {
        const {
            vehicles, isPopulated, overlappingTrips, isModalOpen,
        } = this.state;

        return (
            <CustomModal
                className="allocate-vehicles-modal"
                title={ this.props.buttonLabel ? this.props.buttonLabel : 'Allocate vehicles' }
                renderToggleButton={ this.renderModalToggleButton }
                isModalOpen={ isModalOpen }
                onClose={ this.toggleModal }
                okButton={ {
                    label: 'Allocate',
                    onClick: this.allocateVehicles,
                    isDisabled: _.isNull(vehicles) || !isPopulated || !_.isEmpty(overlappingTrips),
                    className: 'allocate-vehicles-modal__save-btn',
                } }>
                { !_.isEmpty(overlappingTrips) && <OverlappingTripsAlert overlappingTrips={ overlappingTrips } /> }
                <dl className="row">
                    <dt className="col-6">Block number:</dt>
                    <dd className="col-6">{ this.props.block.operationalBlockId }</dd>
                    {
                        (this.props.selectedTrips.length > 0)
                        && (
                            <React.Fragment>
                                <dt className="col-6">Selected Trips:</dt>
                                <dd className="col-6">{ this.props.selectedTrips.map(trip => trip.externalRef).join(', ') }</dd>
                            </React.Fragment>
                        )
                    }
                </dl>
                <SearchCombo
                    data={ styleAssignedTrains(this.props.assignedTrains) }
                    pathToProperty="label"
                    label="New Vehicles"
                    focusInputBackOnClickOut
                    addButtonLabel="Add new vehicle"
                    pathToEditedPropForSuggestion="labelWithAllocatedBlocks"
                    placeholder="Select vehicle"
                    onSelection={ this.onSelection } />
            </CustomModal>
        );
    }
}

export default connect(state => ({
    blocks: getAllBlocks(state),
    assignedTrains: getAllTrainsWithAssignedBlocks(state),
}),
{ allocateVehicles })(AllocateVehiclesModal);
