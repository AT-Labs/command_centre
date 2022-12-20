import L from 'leaflet';

export const getClusterIcon = (cluster, vehicleType, opacityMarkers) => {
    const totalMarkersInCluster = cluster.getChildCount();
    let clusterSizeClass;
    let typeClusterClass;

    if (totalMarkersInCluster <= 9) {
        clusterSizeClass = 'marker-cluster-sm';
    } else if (totalMarkersInCluster >= 10 && totalMarkersInCluster <= 99) {
        clusterSizeClass = 'marker-cluster-md';
    } else {
        clusterSizeClass = 'marker-cluster-lg';
    }

    if (vehicleType.includes('Bus')) {
        typeClusterClass = 'marker-cluster-bus';
    } else if (vehicleType.includes('Train')) {
        typeClusterClass = 'marker-cluster-train';
    } else {
        typeClusterClass = 'marker-cluster-ferry';
    }

    return L.divIcon({
        html: `<div><span>${totalMarkersInCluster}</span></div>`,
        className: `marker-cluster ${clusterSizeClass} ${typeClusterClass} ${opacityMarkers}`,
    });
};
