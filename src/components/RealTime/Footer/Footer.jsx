import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { updateRealTimeDetailView } from '../../../redux/actions/navigation';
import { clearDetail } from '../../../redux/actions/realtime/detail/common';
import { clearSearchResults } from '../../../redux/actions/search';
import { isLoading } from '../../../redux/selectors/activity';
import { shouldGetActiveRealTimeDetailView } from '../../../redux/selectors/realtime/detail';
import VIEW_TYPE from '../../../types/view-types';
import CustomButton from '../../Common/CustomButton/CustomButton';

export class Footer extends React.Component {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        updateRealTimeDetailView: PropTypes.func.isRequired,
        clearDetail: PropTypes.func.isRequired,
        clearSearchResults: PropTypes.func.isRequired,
        shouldGetActiveRealTimeDetailView: PropTypes.bool.isRequired,
    }

    handleResetOnClick = () => {
        this.props.clearDetail();
        this.props.clearSearchResults();
        this.props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT);
    }

    render() {
        return this.props.shouldGetActiveRealTimeDetailView && (
            <footer className="footer flex-shrink-0 d-flex justify-content-around bg-white border-top shadow-lg">
                <CustomButton
                    className="footer__clear-results my-3 rounded-0"
                    color="secondary"
                    tabIndex="0"
                    ariaLabel="Clear Results"
                    isDisabled={ this.props.isLoading }
                    onClick={ this.handleResetOnClick }>
                    <span>Clear Results</span>
                </CustomButton>
            </footer>
        );
    }
}

export default connect(
    state => ({
        isLoading: isLoading(state),
        shouldGetActiveRealTimeDetailView: shouldGetActiveRealTimeDetailView(state),
    }),
    { clearDetail, clearSearchResults, updateRealTimeDetailView },
)(Footer);
