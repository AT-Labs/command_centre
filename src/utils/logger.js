import * as Sentry from '@sentry/react';

export const captureError = (error, data) => {
    Sentry.captureException(error, (scope) => {
        if (data) {
            scope.setContext('extra-data', data);
        }
    });
};
