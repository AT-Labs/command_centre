import React from 'react';
import PropTypes from 'prop-types';

class GoogleTagManager extends React.Component {
    static propTypes = {
        gtmId: PropTypes.string.isRequired,
        dataLayerName: PropTypes.string,
    };

    static defaultProps = {
        dataLayerName: 'dataLayer',
    };

    componentDidMount() {
        window[this.props.dataLayerName] = window[this.props.dataLayerName] || [];
        window[this.props.dataLayerName].push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js',
        });
        const f = document.getElementsByTagName('script')[0];
        const j = document.createElement('script');
        const dl = this.props.dataLayerName !== 'dataLayer' ? `&l=${this.props.dataLayerName}` : '';
        j.async = true;
        j.src = `https://www.googletagmanager.com/gtm.js?id=${this.props.gtmId}${dl}`;
        f.parentNode.insertBefore(j, f);
    }

    render() {
        return null;
    }
}

export default GoogleTagManager;
