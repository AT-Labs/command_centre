import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { FaPlus } from 'react-icons/fa';
import {
    FormGroup, Label, Button, Input,
} from 'reactstrap';
import moment from 'moment';

import SearchTheme from '../../Common/search-theme';
import ERROR_TYPE from '../../../../types/error-types';
import { SERVICE_DATE_FORMAT } from '../../../../utils/control/routes';
import { addOperationalBlockRun } from '../../../../redux/actions/control/blocks';
import { getAllBlocks, getBlocksLoadingState } from '../../../../redux/selectors/control/blocks';
import { dismissError } from '../../../../redux/actions/activity';
import { getError } from '../../../../redux/selectors/activity';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ModalAlert from './ModalAlert';

export class AddNewBlockModal extends React.Component {
    static propTypes = {
        addOperationalBlockRun: PropTypes.func.isRequired,
        dismissError: PropTypes.func.isRequired,
        blocks: PropTypes.array.isRequired,
        error: PropTypes.object,
        isLoading: PropTypes.bool,
    }

    static defaultProps = {
        error: {},
        isLoading: false,
    }

    constructor() {
        super();

        this.state = {
            operationalBlockId: '',
            isModalOpen: false,
        };
    }

    isErrorEmpty = () => _.isEmpty(this.props.error.addBlock)

    handleBlockNumberChange = (event) => {
        const { value } = event.target;
        this.setState({ operationalBlockId: value });
        if (!this.isErrorEmpty()) this.props.dismissError('addBlock');
    }

    addOperationalBlockRun = () => {
        if (!this.props.error.addBlock) {
            const { operationalBlockId } = this.state;
            const operationalBlockRun = { operationalBlockId, serviceDate: moment().format(SERVICE_DATE_FORMAT), operationalTrips: [] };
            this.props.addOperationalBlockRun(operationalBlockRun)
                .then(() => this.toggleModal());
        }
    }

    toggleModal = () => {
        this.setState(prevState => ({
            isModalOpen: !prevState.isModalOpen,
            operationalBlockId: '',
        }));
        if (!this.isErrorEmpty()) this.props.dismissError('addBlock');
    }

    renderModalToggleButton = () => (
        <Button
            className="add-new-block-modal__btn cc-btn-secondary"
            onClick={ this.toggleModal }
            disabled={ !_.isEmpty(this.props.error.addBlock) }>
            <FaPlus
                className="cc-btn-secondary__icon" />
            Add new block
        </Button>
    )

    render() {
        const { isModalOpen, operationalBlockId } = this.state;
        const { error, blocks, isLoading } = this.props;
        const isBlockValid = _.isEmpty(blocks.find(block => block.operationalBlockId === operationalBlockId));
        return (
            <CustomModal
                className="add-new-block-modal"
                title="Add new block"
                renderToggleButton={ this.renderModalToggleButton }
                isModalOpen={ isModalOpen }
                onClose={ this.toggleModal }
                okButton={ {
                    label: 'Add new block',
                    onClick: this.addOperationalBlockRun,
                    isDisabled: _.isEmpty(operationalBlockId) || !isBlockValid || !this.isErrorEmpty() || isLoading,
                    className: 'add-new-block-modal__save-btn',
                } }>
                <ModalAlert
                    color="danger"
                    isOpen={ !this.isErrorEmpty() || !isBlockValid }
                    content={ <span>{ error.addBlock || ERROR_TYPE.blockExisted }</span> } />
                <FormGroup>
                    <Label for="block-number">Block number</Label>
                    <Input
                        type="text"
                        id="block-number"
                        className={ SearchTheme.input }
                        placeholder="Enter block number (max 10 characters)"
                        maxLength="10"
                        value={ operationalBlockId }
                        onChange={ this.handleBlockNumberChange } />
                </FormGroup>
            </CustomModal>
        );
    }
}

export default connect(state => ({
    blocks: getAllBlocks(state),
    error: getError(state),
    isLoading: getBlocksLoadingState(state),
}),
{ addOperationalBlockRun, dismissError })(AddNewBlockModal);
