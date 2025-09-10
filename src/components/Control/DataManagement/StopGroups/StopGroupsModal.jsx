import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isNull, isEmpty } from 'lodash-es';
import { IoIosWarning } from 'react-icons/io';
import { Input, Label } from 'reactstrap';

import CustomModal from '../../../Common/CustomModal/CustomModal';
import PickList from '../../../Common/PickList/PickList';
import { getAllStops } from '../../../../redux/selectors/control/stopMessaging/stops';
import { dismissError } from '../../../../redux/actions/activity';
import { getError } from '../../../../redux/selectors/activity';
import ModalAlert from '../../BlocksView/BlockModals/ModalAlert';

const MAX_CHARACTERS = 100;
const INIT_STATE = {
    stops: [],
    title: '',
    hasModalBeenOpen: true,
    isModalOpen: false,
};

export class StopGroupsModal extends React.Component {
    static propTypes = {
        isModalOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        modalTitle: PropTypes.string.isRequired,
        allStops: PropTypes.array.isRequired,
        onAction: PropTypes.func.isRequired,
        activeStopGroup: PropTypes.object, // eslint-disable-line
        dismissError: PropTypes.func.isRequired,
        error: PropTypes.object,
    };

    static defaultProps = {
        error: {},
        activeStopGroup: null,
    };

    constructor(props) {
        super(props);

        this.state = INIT_STATE;
    }

    static getDerivedStateFromProps(props, state) {
        if (props.activeStopGroup && state.hasModalBeenOpen) {
            const { activeStopGroup: { stops, title } } = props;
            return {
                stops,
                title,
                hasModalBeenOpen: false,
            };
        }
        if (!props.isModalOpen) {
            return INIT_STATE;
        }
        return null;
    }

    dismissErrorHandler = () => !isNull(this.props.error.createStopGroup) && this.props.dismissError('createStopGroup');

    toggleModal = () => {
        this.setState({
            stops: [],
            title: '',
            hasModalBeenOpen: true, // eslint-disable-line
        }, () => {
            this.props.onClose();
            this.dismissErrorHandler();
        });
    };

    onFormFieldsChange = (name, value) => {
        this.setState({
            [name]: value,
        }, () => this.dismissErrorHandler());
    };

    updateStopGroup = () => {
        if (isNull(this.props.error.createStopGroup)) {
            const {
                stops, title,
            } = this.state;
            const payload = {
                title,
                stops,
            };
            this.props.onAction(payload)
                .then(() => this.toggleModal())
                .catch((error) => console.error('Failed to perform stop group action:', error));
        }
    };

    render() {
        const { error, isModalOpen, modalTitle, allStops } = this.props;
        const { stops, title } = this.state;
        const inputLabelAndPlaceholder = 'Search for a stop or group';
        const isMaxCharactersLengthExceeded = title.length > MAX_CHARACTERS;
        const isSaveButtonDisabled = isEmpty(stops)
        || title === ''
        || isMaxCharactersLengthExceeded;

        return (
            <CustomModal
                className="stop-group-modal cc-modal-standard-width"
                title={ modalTitle }
                isModalOpen={ isModalOpen }
                onClose={ this.toggleModal }
                okButton={ {
                    label: 'Save Stop Group',
                    onClick: this.updateStopGroup,
                    isDisabled: isSaveButtonDisabled,
                    className: 'stop-group-modal__save-btn',
                } }>
                <div className="row">
                    <div className="col">
                        <ModalAlert
                            color="danger"
                            isOpen={ !isNull(error.createStopGroup) }
                            content={ <span>{ error.createStopGroup }</span> } />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6 my-3">
                        <Label for="stop-group-name" className="font-weight-bold">Stop group name:</Label>
                        <Input
                            type="text"
                            id="stop-group-name"
                            value={ title }
                            className="stop-group-modal__name cc-form-control"
                            placeholder="Stop group name"
                            onChange={ event => this.onFormFieldsChange('title', event.target.value) } />
                        {
                            isMaxCharactersLengthExceeded && (
                                <div className="stop-group-modal__name-alert cc-modal-field-alert  d-flex align-items-end text-danger">
                                    <IoIosWarning size={ 20 } className="mr-1" />
                                    <span>
                                        {`The name is ${title.length - MAX_CHARACTERS} characters too long`}
                                    </span>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="row pt-3">
                    <div className="col">
                        <PickList
                            staticItemList={ allStops }
                            selectedValues={ stops }
                            onChange={ values => this.setState({ stops: values }) }
                            minValueLength={ 2 }
                            leftPaneLabel={ `${inputLabelAndPlaceholder}:` }
                            leftPaneClassName="cc__picklist-pane-left"
                            leftPanePlaceholder={ inputLabelAndPlaceholder }
                            rightPaneLabel="Selected stops/groups:"
                            rightPaneClassName="cc__picklist-pane-right"
                            rightPanePlaceholder={ inputLabelAndPlaceholder }
                            valueKey="value"
                            labelKey="label" />
                    </div>
                </div>
            </CustomModal>
        );
    }
}

export default connect(
    state => ({
        error: getError(state),
        allStops: getAllStops(state),
    }),
    { dismissError },
)(StopGroupsModal);
