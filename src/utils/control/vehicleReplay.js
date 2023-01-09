import leaflet from 'leaflet';

const iconSize = 15;

export const generateVehiclePositionIcon = (markerColor, bearing) => {
    const vehiclePositionIcon = `<svg viewBox="0 0 200 200"
        style="stroke:white;stroke-width:40px;fill:${markerColor};transform:rotate(${bearing}deg)"
        width="${iconSize}" height="${iconSize}">
            <path d="M0 200 L100 0 L200 200 Z" />
        Sorry, your browser does not support SVG.
    </svg>`;

    const customIcon = new leaflet.DivIcon({
        html: vehiclePositionIcon,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize],
        className: 'vp-icon',
    });

    return customIcon;
};
