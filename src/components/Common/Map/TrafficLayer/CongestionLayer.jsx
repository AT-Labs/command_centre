import { isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { FeatureGroup, Polyline } from 'react-leaflet';
import { generateUniqueID } from '../../../../utils/helpers';
import { CONGESTION_THRESHOLD_LOW, CONGESTION_THRESHOLD_MEDIUM } from '../../../../constants/traffic';

export class CongestionLayer extends React.PureComponent {
    static propTypes = {
        data: PropTypes.array,
        weight: PropTypes.number,
        filters: PropTypes.array,
    };

    static defaultProps = {
        data: [],
        weight: 5,
        filters: [],
    };

    constructor(props) {
        super(props);
        this.polylineGroupRef = React.createRef();
    }

    getColor = (relativeSpeed) => {
        if (relativeSpeed > CONGESTION_THRESHOLD_LOW) {
            return 'Green';
        }
        if (relativeSpeed > CONGESTION_THRESHOLD_MEDIUM) {
            return 'Orange';
        }
        if (relativeSpeed > 0) {
            return 'Red';
        }
        return 'Green';
    };

    applyFilters = (relativeSpeed, filters) => {
        if (relativeSpeed > CONGESTION_THRESHOLD_LOW || !relativeSpeed) {
            return filters.includes('Low');
        }
        if (relativeSpeed > CONGESTION_THRESHOLD_MEDIUM) {
            return filters.includes('Medium');
        }
        if (relativeSpeed > 0) {
            return filters.includes('High');
        }
        return false;
    };

    componentDidUpdate() {
        if (this.polylineGroupRef.current) this.polylineGroupRef.current.leafletElement.bringToBack();
    }

    render() {
        const { data, weight, filters } = this.props;
        return !isEmpty(data)
            ? (
                <FeatureGroup ref={ this.polylineGroupRef }>
                    {data.map(flow => flow.features
                        .filter(f => this.applyFilters(f.speed.relativeSpeed, filters))
                        .map(feature => (
                            <Polyline
                                positions={ feature.coordinates.map(([lon, lat]) => [lat, lon]) }
                                weight={ weight }
                                color={ this.getColor(feature.speed.relativeSpeed) }
                                opacity={ 0.5 }
                                key={ `${flow.openlr}-${generateUniqueID()}` }
                            />
                        )))}
                </FeatureGroup>
            )
            : null;
    }
}
