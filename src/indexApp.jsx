import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './utils/dateLocale';
import App from './components/App/App';
import store from './redux/store';

import './assets/styles/bootstrap-theme.scss';

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
