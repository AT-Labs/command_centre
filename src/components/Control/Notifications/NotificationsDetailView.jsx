import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { LABEL_TITLE, LABEL_DESCRIPTION } from '../../../constants/notifications';
import { isNotificationUpdateAllowed } from '../../../redux/selectors/control/notifications';

export const NotificationsDetailView = (props) => {
    const { notification } = props;
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');

    const canEditField = () => isNotificationUpdateAllowed(notification);

    return (
        <div className="p-4">
            <Form>
                <div className="row mt-3">
                    <section className="col-12">
                        <FormGroup className="mt-2">
                            <Label for="notification-detail__header">
                                <span className="font-size-md font-weight-bold">{LABEL_TITLE}</span>
                            </Label>
                            <Input id="notification-detail__header"
                                className="border border-dark"
                                value={ title }
                                disabled={ !canEditField() }
                                onChange={ e => setTitle(e.currentTarget.value) }
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="notification-detail__description">
                                <span className="font-size-md font-weight-bold">{LABEL_DESCRIPTION}</span>
                            </Label>
                            <Input id="notification-detail__description"
                                className="textarea-no-resize border border-dark"
                                type="textarea"
                                disabled={ !canEditField() }
                                value={ description }
                                onChange={ e => setDescription(e.currentTarget.value) }
                                rows={ 5 }
                            />
                        </FormGroup>
                    </section>
                    { canEditField() && (
                        <section className="col-12">
                            <FormGroup className="d-flex align-items-end justify-content-end">
                                <Button
                                    className="ml-3 mr-3"
                                    onClick={ () => {} }
                                >
                                    Delete
                                </Button>
                                <Button
                                    className="ml-3 mr-3"
                                    onClick={ () => {} }
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    className="cc-btn-primary ml-3"
                                    onClick={ () => {} }
                                >
                                    Publish
                                </Button>
                            </FormGroup>
                        </section>
                    ) }
                </div>
            </Form>
        </div>
    );
};

NotificationsDetailView.propTypes = {
    notification: PropTypes.object.isRequired,
};

export default NotificationsDetailView;
