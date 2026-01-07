/* eslint-disable no-console */
import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getIncidentToEdit } from '../../../../../redux/selectors/control/incidents';
import { getDisruption as getDisruptionAPI } from '../../../../../utils/transmitters/disruption-mgt-api';
import { updateIncidentToEdit } from '../../../../../redux/actions/control/incidents';

export function updateDisruptionWithFetchData(fetchedDisruption, disruption) {
    if (fetchedDisruption == null) return null;

    // Moving shapeWkt over to fetchedDisruption: Somehow, the caller of <EditEffectpanel> have appended shapeWkt. Reusing that.
    const shapeWktMap = new Map(
        disruption.affectedEntities.affectedRoutes.map(route => [route.routeId, route.shapeWkt]),
    );
    const mergedDisruption = {
        ...disruption,
        ...fetchedDisruption,
        affectedEntities: {
            ...disruption.affectedEntities,
            affectedRoutes: fetchedDisruption.affectedEntities.map(entity => ({
                ...entity,
                shapeWkt: shapeWktMap.get(entity.routeId),
            })),
        },
    };

    return mergedDisruption;
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
            console.log('Fetch disruption for diversion modal if needed.');
            if (shouldRefetchDiversions || (isDiversionManagerOpen && disruption.disruptionId && !fetchedDisruption)) {
                console.log('Fetch disruption for diversion modal IS NEEDED');
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

        console.log('---Fetched disruption changed:', fetchedDisruption);

        // Build merged disruption with shapeWkt preserved from local state
        const mergedDisruption = updateDisruptionWithFetchData(fetchedDisruption, disruption);

        // Update local state with merged data (including shapeWkt)
        updateDisruptionState(mergedDisruption);

        // Update redux incidentToEdit with SAME merged data (not raw fetchedDisruption)
        console.log('-----Going to update:', incidentToEdit);
        const ammendedIncidentToUpdate = {
            ...incidentToEdit,
            disruptions: incidentToEdit.disruptions.map((d) => {
                if (d.incidentNo === disruption.incidentNo) return mergedDisruption;
                return d;
            }),
        };
        console.log('-----Amended incident:[b4,after]');
        console.log(JSON.stringify(incidentToEdit));
        console.log(JSON.stringify(ammendedIncidentToUpdate));
        dispatch(updateIncidentToEdit(ammendedIncidentToUpdate));
    }, [fetchedDisruption]);

    return {
        fetchedDisruption,
        setFetchedDisruption,
        shouldRefetchDiversions,
        setShouldRefetchDiversions,
    };
}
