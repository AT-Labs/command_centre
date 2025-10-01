import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import * as Sentry from '@sentry/react';

import './utils/dateLocale';
import App from './components/App/App';
import store from './redux/store';

import './assets/styles/bootstrap-theme.scss';

const {
    REACT_APP_DISABLE_SENTRY,
    REACT_APP_SENTRY_ENVIRONMENT,
    REACT_APP_SENTRY_DSN,
    REACT_APP_SENTRY_TRACES_RATE,
    REACT_APP_SENTRY_REPLAY_SESSION_RATE,
    REACT_APP_SENTRY_REPLAY_ERROR_RATE,
} = process.env;

if (REACT_APP_DISABLE_SENTRY !== 'true') {
    Sentry.init({
        environment: REACT_APP_SENTRY_ENVIRONMENT,
        dsn: REACT_APP_SENTRY_DSN,
        normalizeDepth: 3,
        integrations: [
            new Sentry.BrowserTracing({
                tracePropagationTargets: ['localhost', /^\//],
            }),
            new Sentry.Replay(),
        ],
        // Performance Monitoring
        tracesSampleRate: +REACT_APP_SENTRY_TRACES_RATE,
        // Session Replay
        replaysSessionSampleRate: +REACT_APP_SENTRY_REPLAY_SESSION_RATE,
        replaysOnErrorSampleRate: +REACT_APP_SENTRY_REPLAY_ERROR_RATE,
    });
}

ReactDOM.render(
    <Router>
        <Provider store={ store }>
            <Switch>
                <Route path="/:mainViewType/:controlOrEntityType/:entityId">
                    <App />
                </Route>
                <Route path="/:mainViewType/:controlOrEntityType">
                    <App />
                </Route>
                <Route path="/:mainViewType">
                    <App />
                </Route>
                <Route path="">
                    <App />
                </Route>
            </Switch>
        </Provider>
    </Router>,
    document.getElementById('root'),
);

// expose store when run in Cypress (https://www.cypress.io/blog/2018/11/14/testing-redux-store/)
if (window.Cypress) {
    window.store = store;
}
