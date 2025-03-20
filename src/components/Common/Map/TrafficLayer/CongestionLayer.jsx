import { isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { FeatureGroup, Polyline } from 'react-leaflet';
import { generateUniqueID } from '../../../../utils/helpers';
import { getColor, applyFilters } from '../../../../utils/traffic';

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

    componentDidUpdate() {
        if (this.polylineGroupRef.current) this.polylineGroupRef.current.leafletElement.bringToBack();
    }

    render() {
        const { data, weight, filters } = this.props;
        return !isEmpty(data)
            ? (
                <FeatureGroup ref={ this.polylineGroupRef }>
                    {data.map(flow => flow.features
                        .filter(f => applyFilters(f.speed.relativeSpeed, filters))
                        .map(feature => (
                            <Polyline
                                positions={ feature.coordinates.map(([lon, lat]) => [lat, lon]) }
                                weight={ weight }
                                color={ getColor(feature.speed.relativeSpeed) }
                                opacity={ 0.5 }
                                key={ `${flow.openlr}-${generateUniqueID()}` }
                            />
                        )))}
                </FeatureGroup>
            )
            : null;
    }
}
