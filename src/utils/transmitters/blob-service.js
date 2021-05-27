const STORAGE_ACOUNT = process.env.REACT_APP_STORAGE_ACOUNT;
const BLOB_CONTAINER = process.env.REACT_APP_BLOB_CONTAINER;
const RELEASE_NOTES_FILENAME = process.env.REACT_APP_RELEASE_NOTES_FILENAME;
const MANUAL_FILENAME = process.env.REACT_APP_MANUAL_FILENAME;

let releaseNotesPromise = null;
export const getReleaseNotes = () => {
    if (!releaseNotesPromise) {
        releaseNotesPromise = fetch(`https://${STORAGE_ACOUNT}.blob.core.windows.net/${BLOB_CONTAINER}/${RELEASE_NOTES_FILENAME}`, { method: 'GET' }).then((response) => {
            if (response.ok && response.status === 200) {
                return response.json();
            }
            releaseNotesPromise = null; // Dont cache request if didn't succeed
            return null;
        }).catch(() => {
            releaseNotesPromise = null; // Dont cache request if didn't succeed
        });
    }

    return releaseNotesPromise;
};

export const getManualLink = () => `https://${STORAGE_ACOUNT}.blob.core.windows.net/${BLOB_CONTAINER}/${MANUAL_FILENAME}`;
