import React from 'react';

import { isChrome } from '../../../utils/helpers';
import CustomModal from '../CustomModal/CustomModal';

class BrowserCompatibilityModal extends React.Component {
    state = {
        isModalOpen: !isChrome,
    };

    render() {
        return (
            <CustomModal
                className="browser-compatibility-modal"
                title="Unsupported Browser"
                isModalOpen={ this.state.isModalOpen }
                okButton={ {
                    label: 'OK',
                    onClick: () => this.setState(prevState => ({ isModalOpen: !prevState.isModalOpen })),
                    className: 'browser-compatibility-modal__ok-btn',
                } }>
                <span>For the best user experience use the Google Chrome web browser. Some features may not work in other browsers.</span>
            </CustomModal>
        );
    }
}

export default BrowserCompatibilityModal;
