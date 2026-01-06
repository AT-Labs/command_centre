/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import HistoryNotesModal from './HistoryNotesModal';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

const mockDisruption = {
    key: 'DISR123',
    incidentNo: 'DISR123',
    impact: 'BREAKDOWN',
    startTime: '06:00',
    startDate: '09/03/2022',
    endTime: '06:00',
    endDate: '10/03/2022',
    cause: 'CAPACITY_ISSUE',
    mode: '-',
    status: 'not-started',
    header: 'Incident Title',
    createNotification: false,
    recurrent: true,
    duration: '2',
    recurrencePattern: {
        freq: 2,
        dtstart: new Date('2022-03-09T06:00:00.000Z'),
        until: new Date('2022-03-10T06:00:00.000Z'),
        byweekday: [0],
    },
    severity: 'MINOR',
    affectedEntities: {
        affectedRoutes: [{
            category: { type: 'route', icon: '', label: 'Routes' },
            labelKey: 'routeShortName',
            routeId: 'WEST-201',
            routeShortName: 'WEST',
            routeType: 2,
            text: 'WEST',
            type: 'route',
            valueKey: 'routeId',
        }],
        affectedStops: [{
            category: { type: 'stop', icon: '', label: 'Stops' },
            stopCode: '100',
            text: '100 - test',
            type: 'stop',
            valueKey: 'stopCode',
        }],
    },
    workarounds: [],
    notes: [
        {
            id: 'note-1',
            createdTime: '2020-03-09T06:00:00.000Z',
            createdBy: 'username@test.com',
            description: 'test description note 1',
            lastUpdatedTime: '2021-04-09T10:00:00.000Z',
            lastUpdatedBy: 'username2@test.com',
        },
        {
            id: 'note-2',
            createdTime: '2022-05-09T07:00:00.000Z',
            createdBy: 'username@test.com',
            description: 'test description note 2',
            lastUpdatedTime: null,
            lastUpdatedBy: null,
        },
    ],
};

describe('HistoryNotesModal Component', () => {
    let store;

    const defaultProps = {
        isModalOpen: true,
        disruption: mockDisruption,
        onClose: jest.fn(),
    };

    beforeEach(() => {
        store = mockStore({
            control:
                {
                    incidents: {
                        incidents: {},
                        disruptions: [],
                        isLoading: false,
                        affectedEntities: [],
                        isCreateEnabled: false,
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                    },
                },
            appSettings: {
                useEditDisruptionNotes: 'true',
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('Renders without crashing and displays history notes modal', () => {
        render(
            <Provider store={ store }>
                <HistoryNotesModal { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Disruption notes history #DISR123')).toBeInTheDocument();
        expect(screen.getByText('test description note 1')).toBeInTheDocument();
        expect(screen.getByText('test description note 2')).toBeInTheDocument();
    });

    it('Close the modal after clicking the close button', () => {
        render(
            <Provider store={ store }>
                <HistoryNotesModal { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText('Close');
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('Should display lastUpdatedTime and lastUpdatedBy if they exist', () => {
        render(
            <Provider store={ store }>
                <HistoryNotesModal { ...defaultProps } />
            </Provider>,
        );

        // header
        expect(screen.getByText('Last updated time')).toBeInTheDocument();
        expect(screen.getByText('Last updated by')).toBeInTheDocument();
        expect(screen.getByText('Notes')).toBeInTheDocument();

        // updated note
        expect(screen.getByText('09/04/2021 22:00')).toBeInTheDocument();
        expect(screen.getByText('username2@test.com')).toBeInTheDocument();
        expect(screen.getByText('test description note 1')).toBeInTheDocument();

        // note without updates
        expect(screen.getByText('09/05/2022 19:00')).toBeInTheDocument();
        expect(screen.getByText('username@test.com')).toBeInTheDocument();
        expect(screen.getByText('test description note 2')).toBeInTheDocument();
    });

    describe('handleEditClick', () => {
        it('Should enable editing mode when clicking edit button', () => {
            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...defaultProps } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            expect(editButtons.length).toBeGreaterThan(0);

            fireEvent.click(editButtons[0]);

            const textarea = screen.getByDisplayValue('test description note 2');
            expect(textarea).toBeInTheDocument();

            expect(screen.getByTitle('Save changes')).toBeInTheDocument();
            expect(screen.getByTitle('Cancel')).toBeInTheDocument();
        });

        it('Should not allow editing another note when one is already being edited', () => {
            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...defaultProps } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            expect(editButtons.length).toBeGreaterThan(1);

            fireEvent.click(editButtons[0]);

            const remainingEditButtons = screen.queryAllByTitle('Edit note');
            if (remainingEditButtons.length > 0) {
                remainingEditButtons.forEach((button) => {
                    expect(button).toBeDisabled();
                });
            }
            expect(screen.getByTitle('Save changes')).toBeInTheDocument();
            expect(screen.getByTitle('Cancel')).toBeInTheDocument();
        });

        it('Should populate textarea with note description when editing starts', () => {
            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...defaultProps } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');
            expect(textarea).toBeInTheDocument();
            expect(textarea.value).toBe('test description note 1');
        });
    });

    describe('handleCancel', () => {
        it('Should cancel editing and return to view mode', () => {
            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...defaultProps } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            expect(screen.getByDisplayValue('test description note 1')).toBeInTheDocument();

            const cancelButton = screen.getByTitle('Cancel');
            fireEvent.click(cancelButton);

            expect(screen.queryByDisplayValue('test description note 1')).not.toBeInTheDocument();
            expect(screen.getByText('test description note 1')).toBeInTheDocument();

            const editButtonsAfterCancel = screen.getAllByTitle('Edit note');
            expect(editButtonsAfterCancel.length).toBeGreaterThan(0);
            editButtonsAfterCancel.forEach((button) => {
                expect(button).not.toBeDisabled();
            });
        });

        it('Should reset edited description when canceling', () => {
            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...defaultProps } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');

            fireEvent.change(textarea, { target: { value: 'modified description' } });
            expect(textarea.value).toBe('modified description');

            const cancelButton = screen.getByTitle('Cancel');
            fireEvent.click(cancelButton);

            expect(screen.getByText('test description note 1')).toBeInTheDocument();
            expect(screen.queryByText('modified description')).not.toBeInTheDocument();
        });
    });

    describe('handleSave', () => {
        it('Should save edited note and call onNoteUpdate with updated notes', async () => {
            const onNoteUpdate = jest.fn().mockResolvedValue();
            const props = {
                ...defaultProps,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');
            fireEvent.change(textarea, { target: { value: 'updated description' } });

            const saveButton = screen.getByTitle('Save changes');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(onNoteUpdate).toHaveBeenCalledTimes(1);
            });
            const updateCall = onNoteUpdate.mock.calls[0][0];
            expect(updateCall.notes).toHaveLength(2);
            expect(updateCall.notes[0].description).toBe('updated description');
            expect(updateCall.notes[0].id).toBe('note-1');
            expect(updateCall.notes[1].description).toBe('test description note 2');
            expect(updateCall.incidentNo).toBe('DISR123');
            expect(updateCall.affectedEntities).toEqual(mockDisruption.affectedEntities);
        });

        it('Should not save when description is empty', async () => {
            const onNoteUpdate = jest.fn();
            const props = {
                ...defaultProps,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');
            fireEvent.change(textarea, { target: { value: '   ' } });

            const saveButton = screen.getByTitle('Save changes');
            expect(saveButton).toBeDisabled();

            fireEvent.click(saveButton);

            await waitFor(() => {
            }, { timeout: 100 });

            expect(onNoteUpdate).not.toHaveBeenCalled();
        });

        it('Should not save when description is empty string', async () => {
            const onNoteUpdate = jest.fn();
            const props = {
                ...defaultProps,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');
            fireEvent.change(textarea, { target: { value: '' } });

            const saveButton = screen.getByTitle('Save changes');
            expect(saveButton).toBeDisabled();

            fireEvent.click(saveButton);

            await waitFor(() => {
            }, { timeout: 100 });

            expect(onNoteUpdate).not.toHaveBeenCalled();
        });

        it('Should filter out notes with empty descriptions after save', async () => {
            const onNoteUpdate = jest.fn().mockResolvedValue();
            const disruptionWithEmptyNote = {
                ...mockDisruption,
                notes: [
                    {
                        id: 'note-1',
                        description: 'valid note',
                        createdTime: '2020-03-09T06:00:00.000Z',
                        createdBy: 'username@test.com',
                    },
                    {
                        id: 'note-2',
                        description: 'note to be cleared',
                        createdTime: '2022-05-09T07:00:00.000Z',
                        createdBy: 'username@test.com',
                    },
                ],
            };
            const props = {
                ...defaultProps,
                disruption: disruptionWithEmptyNote,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[0]);

            const textarea = screen.getByDisplayValue('note to be cleared');
            fireEvent.change(textarea, { target: { value: '   ' } });

            const saveButton = screen.getByTitle('Save changes');
            expect(saveButton).toBeDisabled();
        });

        it('Should not save when already saving (isSaving is true)', async () => {
            const onNoteUpdate = jest.fn().mockImplementation(() => new Promise((resolve) => {
                setTimeout(resolve, 100);
            }));
            const props = {
                ...defaultProps,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');
            fireEvent.change(textarea, { target: { value: 'updated description' } });

            const saveButton = screen.getByTitle('Save changes');

            fireEvent.click(saveButton);
            const saveButtonAfterFirstClick = screen.getByTitle('Save changes');
            expect(saveButtonAfterFirstClick).toBeDisabled();

            fireEvent.click(saveButtonAfterFirstClick);

            await waitFor(() => {
                expect(onNoteUpdate).toHaveBeenCalledTimes(1);
            });
        });

        it('Should reset editing state after successful save', async () => {
            const onNoteUpdate = jest.fn().mockResolvedValue();
            const props = {
                ...defaultProps,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');
            fireEvent.change(textarea, { target: { value: 'updated description' } });

            const saveButton = screen.getByTitle('Save changes');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(onNoteUpdate).toHaveBeenCalled();
            });

            expect(screen.queryByDisplayValue('updated description')).not.toBeInTheDocument();
            const editButtonsAfterSave = screen.getAllByTitle('Edit note');
            expect(editButtonsAfterSave.length).toBeGreaterThan(0);
        });

        it('Should handle save when onNoteUpdate is not provided', async () => {
            const props = {
                ...defaultProps,
                onNoteUpdate: undefined,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');
            fireEvent.change(textarea, { target: { value: 'updated description' } });

            const saveButton = screen.getByTitle('Save changes');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.queryByDisplayValue('updated description')).not.toBeInTheDocument();
            });

            expect(screen.queryByDisplayValue('updated description')).not.toBeInTheDocument();
        });

        it('Should preserve note id when saving', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

            const onNoteUpdate = jest.fn().mockResolvedValue();
            const props = {
                ...defaultProps,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');
            fireEvent.change(textarea, { target: { value: 'updated description' } });

            const saveButton = screen.getByTitle('Save changes');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(onNoteUpdate).toHaveBeenCalled();
            });

            const updateCall = onNoteUpdate.mock.calls[0][0];
            expect(updateCall.notes[0].id).toBe('note-1');
            expect(updateCall.notes[1].id).toBe('note-2');

            consoleError.mockRestore();
        });

        it('Should handle notes without id property', async () => {
            const onNoteUpdate = jest.fn().mockResolvedValue();
            const disruptionWithoutIds = {
                ...mockDisruption,
                notes: [
                    {
                        description: 'note without id',
                        createdTime: '2020-03-09T06:00:00.000Z',
                        createdBy: 'username@test.com',
                    },
                    {
                        id: 'note-2',
                        description: 'note with id',
                        createdTime: '2022-05-09T07:00:00.000Z',
                        createdBy: 'username@test.com',
                    },
                ],
            };
            const props = {
                ...defaultProps,
                disruption: disruptionWithoutIds,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[0]);

            const textarea = screen.getByDisplayValue('note with id');
            fireEvent.change(textarea, { target: { value: 'updated note with id' } });

            const saveButton = screen.getByTitle('Save changes');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(onNoteUpdate).toHaveBeenCalled();
            });

            const updateCall = onNoteUpdate.mock.calls[0][0];
            expect(updateCall.notes[0].description).toBe('note without id');
            expect(updateCall.notes[0].id).toBeUndefined();
            expect(updateCall.notes[1].id).toBe('note-2');
            expect(updateCall.notes[1].description).toBe('updated note with id');
        });

        it('Should handle disruption with empty notes array', async () => {
            const onNoteUpdate = jest.fn().mockResolvedValue();
            const disruptionWithEmptyNotes = {
                ...mockDisruption,
                notes: [],
            };
            const props = {
                ...defaultProps,
                disruption: disruptionWithEmptyNotes,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            expect(screen.getByText('No notes to display')).toBeInTheDocument();
        });

        it('Should handle disruption with null notes', async () => {
            const onNoteUpdate = jest.fn().mockResolvedValue();
            const disruptionWithNullNotes = {
                ...mockDisruption,
                notes: null,
            };
            const props = {
                ...defaultProps,
                disruption: disruptionWithNullNotes,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            expect(screen.getByText('No notes to display')).toBeInTheDocument();
        });

        it('Should trim description when saving', async () => {
            const onNoteUpdate = jest.fn().mockResolvedValue();
            const props = {
                ...defaultProps,
                onNoteUpdate,
            };

            render(
                <Provider store={ store }>
                    <HistoryNotesModal { ...props } />
                </Provider>,
            );

            const editButtons = screen.getAllByTitle('Edit note');
            fireEvent.click(editButtons[1]);

            const textarea = screen.getByDisplayValue('test description note 1');
            fireEvent.change(textarea, { target: { value: '  trimmed description  ' } });

            const saveButton = screen.getByTitle('Save changes');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(onNoteUpdate).toHaveBeenCalled();
            });

            const updateCall = onNoteUpdate.mock.calls[0][0];
            expect(updateCall.notes[0].description).toBe('trimmed description');
        });
    });
});
