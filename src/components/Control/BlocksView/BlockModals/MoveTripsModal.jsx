import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isNull, isEmpty, join } from 'lodash-es';
import { Button } from 'reactstrap';

import CustomModal from '../../../Common/CustomModal/CustomModal';
import { moveTrips } from '../../../../redux/actions/control/blocks';
import { getAllBlocks } from '../../../../redux/selectors/control/blocks';
import { BlockType, TripType } from '../types';
import ControlSearch from '../../Common/ControlSearch/ControlSearch';
import ERROR_TYPE from '../../../../types/error-types';
import { dismissError } from '../../../../redux/actions/activity';
import { getError } from '../../../../redux/selectors/activity';
import ModalAlert from './ModalAlert';

export class MoveTripsModal extends React.Component {
    static propTypes = {
        moveTrips: PropTypes.func.isRequired,
        block: BlockType.isRequired,
        blocks: PropTypes.arrayOf(BlockType).isRequired,
        buttonLabel: PropTypes.string,
        openModalButtonClass: PropTypes.string,
        selectedTrips: PropTypes.arrayOf(TripType),
        dismissError: PropTypes.func.isRequired,
        error: PropTypes.object,
        disable: PropTypes.bool,
    };

    static defaultProps = {
        buttonLabel: '',
        disable: false,
        openModalButtonClass: '',
        selectedTrips: [],
        error: {},
    };

    constructor() {
        super();

        this.state = {
            selectedBlock: null,
            isModalOpen: false,
        };
    }

    isErrorEmpty = () => isEmpty(this.props.error.moveTrips);

    moveTrips = () => {
        this.props.moveTrips(this.props.block, this.state.selectedBlock, this.props.selectedTrips);
        if (this.isErrorEmpty()) this.toggleModal();
    };

    toggleModal = () => {
        this.setState(prevState => ({
            isModalOpen: !prevState.isModalOpen,
            selectedBlock: null,
        }));
        if (!this.isErrorEmpty()) this.props.dismissError('moveTrips');
    };

    renderModalToggleButton = () => (
        <Button
            className={ this.props.openModalButtonClass ? this.props.openModalButtonClass : 'border-0 bg-at-shore-tint-30 text-primary' }
            color="transparent"
            disabled={ this.props.disable }
            onClick={ this.toggleModal }>
            { this.props.buttonLabel ? this.props.buttonLabel : 'Move trips' }
        </Button>
    );

    onChange = (blockSelectedParam) => {
        this.setState({ selectedBlock: blockSelectedParam });
        if (!this.isErrorEmpty()) this.props.dismissError('moveTrips');
    };

    render() {
        const { selectedBlock, isModalOpen } = this.state;
        return (
            <CustomModal
                className="move-trips-modal"
                title={ this.props.buttonLabel ? this.props.buttonLabel : 'Move trips' }
                renderToggleButton={ this.renderModalToggleButton }
                isModalOpen={ isModalOpen }
                onClose={ this.toggleModal }
                okButton={ {
                    label: 'Move',
                    onClick: this.moveTrips,
                    isDisabled: isNull(selectedBlock) || !this.isErrorEmpty(),
                    className: 'move-trips-modal__save-btn',
                } }>
                <dl className="row">
                    <dt className="col-6">Block number:</dt>
                    <dd className="col-6">{ this.props.block.operationalBlockId }</dd>
                    {
                        (this.props.selectedTrips.length > 0)
                        && (
                            <>
                                <dt className="col-6">Selected Trips:</dt>
                                <dd className="col-6">{ join(this.props.selectedTrips.map(trip => trip.externalRef), ', ') }</dd>
                            </>
                        )
                    }
                </dl>
                <ModalAlert
                    color="danger"
                    isOpen={ !this.isErrorEmpty() }
                    content={ <span>{ this.props.error.moveTrips || ERROR_TYPE.moveTrips }</span> } />
                <ControlSearch
                    id="move-trips-block-search"
                    label="Move to block"
                    focusInputBackOnClickOut
                    onInputValueChange={ () => this.onChange(null) }
                    data={ this.props.blocks }
                    pathToProperty="operationalBlockId"
                    placeholder="Select a block"
                    onSelection={ blockSelectedParam => this.onChange(blockSelectedParam) }
                    value={ selectedBlock ? selectedBlock.operationalBlockId : '' } />
            </CustomModal>
        );
    }
}

export default connect(
    state => ({
        blocks: getAllBlocks(state),
        error: getError(state),
    }),
    { moveTrips, dismissError },
)(MoveTripsModal);
