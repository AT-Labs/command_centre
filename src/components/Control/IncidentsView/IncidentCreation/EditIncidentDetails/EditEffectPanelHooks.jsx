import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getIncidentToEdit } from '../../../../../redux/selectors/control/incidents';
import { getDisruption as getDisruptionAPI } from '../../../../../utils/transmitters/disruption-mgt-api';
import { updateIncidentToEdit } from '../../../../../redux/actions/control/incidents';

export function updateDisruptionWithFetchData(fetchedDisruption, disruption, updateDisruptionState) {
    if (fetchedDisruption == null) return;

    // Moving shapeWkt over to fetchedDisruption: Somehow, the caller of <EditEffectpanel> have appended shapeWkt. Reusing that.
    const shapeWktMap = new Map(
        disruption.affectedEntities.affectedRoutes.map(route => [route.routeId, route.shapeWkt]),
    );
    const newAffectedRoutes = fetchedDisruption.affectedEntities.map((entity) => {
        const shapeWkt = shapeWktMap.get(entity.routeId);
        return {
            ...entity,
            shapeWkt,
        };
    });

    // Set the new disruption with updated affectedEntities
    updateDisruptionState({
        ...disruption,
        affectedEntities: {
            ...disruption.affectedEntities,
            affectedRoutes: newAffectedRoutes,
        },
    });
}

// Used when diversion is updated, we need to reload saved diversion in disruption data
// This is because diversion code, add diversions diretly in database
export function useDiversionDisruptionRefetcher({
    setIsLoadingDisruption,
    disruption,
    isDiversionManagerOpen,
    updateDisruptionState }) {
    const dispatch = useDispatch();
    const incidentToEdit = useSelector(getIncidentToEdit);
    const [fetchedDisruption, setFetchedDisruption] = useState(null);
    const [shouldRefetchDiversions, setShouldRefetchDiversions] = useState(false);

    // Async support and Cleaning up code
    const isMounted = useRef(false);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // This effect listens to possible changes that need to reload disruption.
    useEffect(() => {
        const fetchDisruptionForDiversion = async () => {
            if (shouldRefetchDiversions || (isDiversionManagerOpen && disruption.disruptionId && !fetchedDisruption)) {
                setShouldRefetchDiversions(false);
                setIsLoadingDisruption(true);
                const disruptionData = await getDisruptionAPI(disruption.disruptionId);

                if (!isMounted.current) return; // Preventing state update after unmount (because of async)
                setFetchedDisruption(disruptionData);
                setIsLoadingDisruption(false);
            }
        };

        fetchDisruptionForDiversion();
    }, [isDiversionManagerOpen, disruption.disruptionId, fetchedDisruption, shouldRefetchDiversions]);

    // When disruption is refreshed from API (usually via diversion modal), we need to update local states with these updates
    useEffect(() => {
        if (!fetchedDisruption) return;

        // Build merged disruption with shapeWkt preserved from local state
        updateDisruptionWithFetchData(fetchedDisruption, disruption, updateDisruptionState);

        // Update local state with merged data (including shapeWkt)
        // updateDisruptionState(mergedDisruption);

        // Update redux incidentToEdit with SAME merged data (not raw fetchedDisruption)
        const ammendedIncidentToUpdate = {
            ...incidentToEdit,
            disruptions: incidentToEdit.disruptions.map(d => (d.incidentNo === disruption.incidentNo ? fetchedDisruption : d)),
        };
        dispatch(updateIncidentToEdit(ammendedIncidentToUpdate));
    }, [fetchedDisruption]);

    return {
        fetchedDisruption,
        setFetchedDisruption,
        shouldRefetchDiversions,
        setShouldRefetchDiversions,
    };
}
