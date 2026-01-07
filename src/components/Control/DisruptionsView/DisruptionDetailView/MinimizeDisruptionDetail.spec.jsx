/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import moment from 'moment';
import { MinimizeDisruptionDetail } from './MinimizeDisruptionDetail';
import { STATUSES } from '../../../../types/disruptions-types';
import { momentFromDateTime } from '../../../../utils/control/disruptions';
import { fetchEndDateFromRecurrence } from '../../../../utils/recurrence';
import { TIME_FORMAT, DATE_FORMAT } from '../../../../constants/disruptions';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: () => [{ value: 'ACCIDENT', label: 'Accident' }],
    useAlertEffects: () => [{ value: 'SIGNIFICANT_DELAYS', label: 'Significant Delays' }],
}));

jest.mock('../../../../utils/control/disruptions', () => ({
    ...jest.requireActual('../../../../utils/control/disruptions'),
    momentFromDateTime: jest.fn(),
}));

jest.mock('../../../../utils/recurrence', () => ({
    ...jest.requireActual('../../../../utils/recurrence'),
    fetchEndDateFromRecurrence: jest.fn(),
}));

const disruptionMock = {
    affectedEntities: [],
    incidentNo: '1234',
    cause: 'ACCIDENT',
    impact: 'SIGNIFICANT_DELAYS',
    disruptionId: 1,
    lastUpdatedTime: '2025-05-27T08:00:00Z',
    recurrent: false,
    mode: 'Bus',
    severity: 'SERIOUS',
    lastUpdatedBy: 'Tester',
    createdTime: '2025-05-25T08:00:00Z',
    createdBy: 'Admin',
    notes: [],
    startTime: '2025-05-27T08:00:00Z',
    endTime: '2025-05-27T09:00:00Z',
    status: STATUSES.DRAFT,
};

const defaultProps = {
    disruption: disruptionMock,
    updateDisruption: jest.fn(),
    isRequesting: false,
    resultDisruptionId: null,
    getRoutesByShortName: jest.fn(),
    shapes: [],
    isLoading: false,
    routeColors: [],
    openCreateDisruption: jest.fn(),
    openCopyDisruption: jest.fn(),
    updateAffectedRoutesState: jest.fn(),
    updateAffectedStopsState: jest.fn(),
    updateEditMode: jest.fn(),
    updateDisruptionToEdit: jest.fn(),
    uploadDisruptionFiles: jest.fn(),
    deleteDisruptionFile: jest.fn(),
    routes: [],
    stops: [],
    boundsToFit: [],
    clearDisruptionActionResult: jest.fn(),
    useDraftDisruptions: true,
    useParentChildIncident: false,
};

const mockIncidents = [
    {
        incidentId: 1,
        disruptionId: 1,
        incidentNo: 'DISR0001',
        incidentTitle: 'Incident 1',
        affectedEntities: [],
        cause: 'ACCIDENT',
        impact: 'SIGNIFICANT_DELAYS',
        title: 'Road closure',
        startTime: '2025-05-27T10:00:00Z',
        endTime: '2025-05-27T12:00:00Z',
    },
];

const renderWithStore = (props = {}) => {
    const store = mockStore({
        control:
            {
                disruptions: {
                    disruptions: mockIncidents,
                    activeIncident: null,
                    incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                    isLoading: false,
                    action: {
                        resultDisruptionId: null,
                        isRequesting: false,
                        resultStatus: null,
                        resultMessage: null,
                        resultCreateNotification: false,
                        isCopied: false,
                    },
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [],
                    },
                },
            },
        appSettings: {
            useViewDisruptionDetailsPage: 'true',
            useDisruptionDetails: 'true',
            useEditDisruptionNotes: 'true',
        },
    });
    return render(
        <Provider store={ store }>
            <MinimizeDisruptionDetail { ...defaultProps } { ...props } />
        </Provider>,
    );
};

describe('MinimizeDisruptionDetail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        momentFromDateTime.mockImplementation((date, time) => {
            if (date && time) {
                return moment(`${date}T${time}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`);
            }
            return undefined;
        });
        fetchEndDateFromRecurrence.mockReturnValue('27/05/2025');
    });

    it('renders component with basic elements', () => {
        renderWithStore();

        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
        expect(screen.getByText(/Copy/i)).toBeInTheDocument();
        expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Disruption Notes/i)).toBeInTheDocument();
    });

    it('renders component without copy button', () => {
        renderWithStore({ useParentChildIncident: true });

        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
        expect(screen.queryByText(/Copy/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Disruption Notes/i)).toBeInTheDocument();
    });

    it('button Save Changes should be enabled', () => {
        renderWithStore();

        const button = screen.getByText(/Save Changes/i);
        expect(button).toBeInTheDocument();

        expect(button).toBeEnabled();
    });

    it('updates disruption notes on input', () => {
        renderWithStore();
        const textarea = screen.getByLabelText(/Disruption Notes/i);

        fireEvent.change(textarea, { target: { value: 'New note here' } });

        expect(textarea.value).toBe('New note here');
    });

    it('calls updateDisruption with note when Save Changes is clicked', () => {
        const updateDisruption = jest.fn();
        const disruption = {
            ...disruptionMock,
            notes: [],
        };
        renderWithStore({ updateDisruption, disruption });

        const textarea = screen.getByLabelText(/Disruption Notes/i);
        fireEvent.change(textarea, { target: { value: 'Some update' } });
        const button = screen.getByText(/Save Changes/i);
        expect(button).toBeInTheDocument();
        button.focus();
        fireEvent.click(button);

        expect(updateDisruption).toHaveBeenCalled();
        const disruptionPassed = updateDisruption.mock.calls[0][0];
        expect(disruptionPassed.notes.some(note => note.description === 'Some update')).toBe(true);
    });

    it('directly copies when stops or routes are empty', () => {
        const openCopyDisruption = jest.fn();
        const updateEditMode = jest.fn();
        const updateDisruptionToEdit = jest.fn();

        renderWithStore({
            stops: [],
            routes: [],
            openCopyDisruption,
            updateEditMode,
            updateDisruptionToEdit,
        });

        fireEvent.click(screen.getByText(/Copy/i));

        expect(openCopyDisruption).toHaveBeenCalledWith(true, disruptionMock.incidentNo);
        expect(updateEditMode).toHaveBeenCalled();
        expect(updateDisruptionToEdit).toHaveBeenCalled();
    });

    it('shows "Preview" when useDraftDisruptions is true and disruption is a draft', () => {
        renderWithStore({ useDraftDisruptions: true });

        expect(screen.getByText(/Preview$/i)).toBeInTheDocument(); // Note: ends with "Preview"
    });

    it('shows "Preview & Share" when disruption is not a draft', () => {
        const nonDraftDisruption = { ...disruptionMock, status: STATUSES.PUBLISHED };
        renderWithStore({ disruption: nonDraftDisruption });

        expect(screen.getByText(/Preview & Share/i)).toBeInTheDocument();
    });

    it('renders result message when resultStatus and resultDisruptionId match disruptionId', () => {
        renderWithStore({
            resultDisruptionId: 1,
            resultStatus: 'success',
            resultMessage: 'Saved successfully',
        });

        expect(screen.getByText(/Saved successfully/i)).toBeInTheDocument();
    });

    it('clears routes and calls copy logic when confirmation modal is confirmed', async () => {
        const updateAffectedRoutesState = jest.fn();
        const openCopyDisruption = jest.fn();
        const updateEditMode = jest.fn();
        const updateDisruptionToEdit = jest.fn();

        renderWithStore({
            stops: [{ stopCode: 'S1', routeId: 'R1' }],
            routes: [{ routeId: 'R2' }],
            updateAffectedRoutesState,
            openCopyDisruption,
            updateEditMode,
            updateDisruptionToEdit,
        });

        const copyButton = screen.getByText(/Copy/i);
        expect(copyButton).toBeInTheDocument();
        copyButton.focus();
        fireEvent.click(copyButton);
        const confirmationText = await screen.findByText(/By confirming this action/i);
        expect(confirmationText).toBeInTheDocument();

        expect(updateAffectedRoutesState).toHaveBeenCalledWith([]);
    });

    it('shows expand note icon and modal when useDisruptionNotePopup is true', async () => {
        const { container } = renderWithStore({ useDisruptionNotePopup: true });

        const expandIcon = container.querySelector('.disruption-detail-expand-note-icon');
        expect(expandIcon).toBeInTheDocument();

        fireEvent.click(expandIcon);
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('does not show expand note icon when useDisruptionNotePopup is false', () => {
        const { container } = renderWithStore({ useDisruptionNotePopup: false });

        const expandIcon = container.querySelector('.disruption-detail-expand-note-icon');
        expect(expandIcon).not.toBeInTheDocument();
    });

    it('renders expand note icon and opens AddNoteModal when clicked', async () => {
        const { container } = renderWithStore({ useDisruptionNotePopup: true });

        const expandIcon = container.querySelector('.disruption-detail-expand-note-icon');
        expect(expandIcon).toBeInTheDocument();

        fireEvent.click(expandIcon);

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('allows entering a note and submitting via AddNoteModal', async () => {
        const updateDisruption = jest.fn();
        const { container } = renderWithStore({ useDisruptionNotePopup: true, updateDisruption });

        const expandIcon = container.querySelector('.disruption-detail-expand-note-icon');
        expect(expandIcon).toBeInTheDocument();
        fireEvent.click(expandIcon);

        const textareas = await screen.findAllByRole('textbox');
        const modalTextarea = textareas[textareas.length - 1];
        fireEvent.change(modalTextarea, { target: { value: 'Note from modal' } });

        const submitButton = screen.getByRole('button', { name: /Add note/i });
        fireEvent.click(submitButton);

        expect(updateDisruption).toHaveBeenCalled();
        const disruptionArg = updateDisruption.mock.calls[0][0];
        expect(disruptionArg.notes.some(note => note.description === 'Note from modal')).toBe(true);
    });

    it('allows entering a note in AddNoteModal input only', async () => {
        const { container } = renderWithStore({ useDisruptionNotePopup: true });

        const expandIcon = container.querySelector('.disruption-detail-expand-note-icon');
        expect(expandIcon).toBeInTheDocument();
        fireEvent.click(expandIcon);

        const textareas = await screen.findAllByRole('textbox');
        const modalTextarea = textareas[textareas.length - 1];
        fireEvent.change(modalTextarea, { target: { value: 'Note in modal only' } });

        expect(modalTextarea.value).toBe('Note in modal only');
    });

    describe('onNoteUpdate', () => {
        it('Should format notes and call updateDisruption with updated disruption when editing note in HistoryNotesModal', async () => {
            const updateDisruption = jest.fn().mockResolvedValue();
            const disruption = {
                ...disruptionMock,
                notes: [
                    { id: 'note-1', description: 'Note 1', createdTime: '2025-05-27T08:00:00Z', createdBy: 'user1' },
                    { id: 'note-2', description: 'Note 2', createdTime: '2025-05-27T09:00:00Z', createdBy: 'user2' },
                ],
            };

            renderWithStore({
                disruption,
                updateDisruption,
                useParentChildIncident: true,
            });

            await waitFor(() => {
                const historyIcon = screen.queryByTitle('View Notes History');
                expect(historyIcon).toBeInTheDocument();
            });

            const historyIcon = screen.getByTitle('View Notes History');
            fireEvent.click(historyIcon);

            await waitFor(() => {
                expect(screen.getByText(/Disruption notes history/i)).toBeInTheDocument();
            });

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[0]);

            const textarea = screen.getByDisplayValue('Note 2');
            fireEvent.change(textarea, { target: { value: 'Updated Note 2' } });

            const saveButton = screen.getByTitle('Save changes');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(updateDisruption).toHaveBeenCalled();
            });

            const callArgs = updateDisruption.mock.calls[0][0];
            expect(callArgs.notes).toHaveLength(2);
            expect(callArgs.notes.find(n => n.id === 'note-2').description).toBe('Updated Note 2');
            expect(callArgs.notes.find(n => n.id === 'note-1').description).toBe('Note 1');
        });

        it('Should open HistoryNotesModal when history icon is clicked', async () => {
            const disruption = {
                ...disruptionMock,
                notes: [
                    { id: 'note-1', description: 'Last note', createdTime: '2025-05-27T08:00:00Z' },
                ],
            };

            renderWithStore({
                disruption,
                useParentChildIncident: true,
            });

            await waitFor(() => {
                const historyIcon = screen.queryByTitle('View Notes History');
                expect(historyIcon).toBeInTheDocument();
            });

            const historyIcon = screen.getByTitle('View Notes History');
            fireEvent.click(historyIcon);

            await waitFor(() => {
                expect(screen.getByText(/Disruption notes history/i)).toBeInTheDocument();
            });
        });

        it('Should pass disruption and onNoteUpdate to HistoryNotesModal', async () => {
            const updateDisruption = jest.fn().mockResolvedValue();
            const disruption = {
                ...disruptionMock,
                notes: [
                    { id: 'note-1', description: 'Last note', createdTime: '2025-05-27T08:00:00Z' },
                ],
            };

            renderWithStore({
                disruption,
                updateDisruption,
                useParentChildIncident: true,
            });

            await waitFor(() => {
                const historyIcon = screen.queryByTitle('View Notes History');
                expect(historyIcon).toBeInTheDocument();
            });

            const historyIcon = screen.getByTitle('View Notes History');
            fireEvent.click(historyIcon);

            await waitFor(() => {
                expect(screen.getByText(/Disruption notes history/i)).toBeInTheDocument();
            });

            expect(screen.getByText('Last note')).toBeInTheDocument();
        });
    });
});
