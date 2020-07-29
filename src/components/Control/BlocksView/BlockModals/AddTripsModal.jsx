import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { Button } from 'reactstrap';

import CustomModal from '../../../Common/CustomModal/CustomModal';
import { addOrphanOperationalTrips } from '../../../../redux/actions/control/blocks';
import { getAllBlocks } from '../../../../redux/selectors/control/blocks';
import { getServiceDate } from '../../../../redux/selectors/control/serviceDate';
import { BlockType } from '../types';
import Picklist from '../../../Common/Picklist/Picklist';
import * as blockMgtApi from '../../../../utils/transmitters/block-mgt-api';
import { BLOCKS_SERVICE_DATE_FORMAT } from '../../../../utils/control/blocks';

export class AddTripsModal extends React.Component {
    static propTypes = {
        addOrphanOperationalTrips: PropTypes.func.isRequired,
        block: BlockType.isRequired,
        buttonLabel: PropTypes.string,
        openModalButtonClass: PropTypes.string,
        disable: PropTypes.bool,
        serviceDate: PropTypes.string.isRequired,
    }

    static defaultProps = {
        buttonLabel: '',
        disable: false,
        openModalButtonClass: '',
    }

    constructor(props) {
        super(props);

        this.state = {
            selectedTripExternalRefs: [],
            isModalOpen: false,
            orphanOperationalTripRuns: [],
            orphanExternalRefs: [],
            isLoading: false,
        };
    }

    async getOrphanTrips() {
        this.setState({ isLoading: true });
        const serviceDate = moment(this.props.serviceDate).format(BLOCKS_SERVICE_DATE_FORMAT);
        const orphanOperationalTripRuns = await blockMgtApi.getOrphanOperationalTripRuns({ serviceDate });
        const orphanExternalRefs = orphanOperationalTripRuns.map(getOrphanOperationalTripRun => ({
            value: getOrphanOperationalTripRun.externalRef,
            label: getOrphanOperationalTripRun.externalRef,
        }));
        this.setState({ orphanExternalRefs, orphanOperationalTripRuns, isLoading: false });
    }

    addOrphanOperationalTrips = () => {
        const { orphanOperationalTripRuns, selectedTripExternalRefs } = this.state;
        const orphanOperationalTripRunsSelected = _.filter(
            orphanOperationalTripRuns,
            orphanOperationalTripRun => _.find(selectedTripExternalRefs, { value: orphanOperationalTripRun.externalRef }),
        );

        this.props.addOrphanOperationalTrips(this.props.block, orphanOperationalTripRunsSelected);
        this.toggleModal();
    }

    toggleModal = () => {
        const { isModalOpen } = this.state;
        if (!isModalOpen) this.getOrphanTrips();
        this.setState(prevState => ({ isModalOpen: !prevState.isModalOpen }));
    }

    renderModalToggleButton = () => (
        <Button
            className={ this.props.openModalButtonClass }
            disabled={ this.props.disable }
            onClick={ this.toggleModal }>
            { this.props.buttonLabel ? this.props.buttonLabel : 'Add trips' }
        </Button>
    )

    render() {
        const { isModalOpen, selectedTripExternalRefs } = this.state;
        const inputLabelAndPlaceholder = 'Search for a trip';

        return (
            <CustomModal
                className="add-trips-modal"
                title={ this.props.buttonLabel ? this.props.buttonLabel : 'Add trips' }
                renderToggleButton={ this.renderModalToggleButton }
                isModalOpen={ isModalOpen }
                onClose={ this.toggleModal }
                okButton={ {
                    label: 'Move',
                    onClick: this.addOrphanOperationalTrips,
                    isDisabled: _.isEmpty(selectedTripExternalRefs),
                    className: 'add-trips-modal__save-btn',
                } }>
                <dl className="row">
                    <dt className="col">Block number:</dt>
                    <dd className="col">{ this.props.block.operationalBlockId }</dd>
                </dl>
                <Picklist
                    staticItemList={ this.state.orphanExternalRefs }
                    minValueLength={ 0 }
                    onChange={ values => this.setState({ selectedTripExternalRefs: values }) }
                    leftPaneLabel={ `${inputLabelAndPlaceholder}:` }
                    leftPaneClassName="cc__picklist-pane-left"
                    leftPanePlaceholder={ inputLabelAndPlaceholder }
                    rightPanelShowSearch={ false }
                    rightPaneLabel="Selected trip:"
                    rightPaneClassName="cc__picklist-pane-right"
                    rightPanePlaceholder={ inputLabelAndPlaceholder }
                    isLoading={ this.state.isLoading } />
            </CustomModal>
        );
    }
}

export default connect(state => ({
    blocks: getAllBlocks(state),
    serviceDate: getServiceDate(state),
}),
{ addOrphanOperationalTrips })(AddTripsModal);
