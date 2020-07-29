import L from 'leaflet';

export const getClusterIcon = (cluster, vehicleType) => {
    const markersInCluster = cluster.getAllChildMarkers().length;
    let className;

    if (markersInCluster <= 9) {
        className = 'marker-cluster-sm';
    } else if (markersInCluster >= 10 && markersInCluster <= 99) {
        className = 'marker-cluster-md';
    } else {
        className = 'marker-cluster-lg';
    }

    return L.divIcon({
        html: `<div><span>${markersInCluster}</span></div>`,
        className: `marker-cluster ${className} marker-cluster-${vehicleType.toLowerCase()}`,
    });
};
