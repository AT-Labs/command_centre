# Auckland Transport Command Centre

Help  Auckland Transport (AT) customer support team efficiently find useful information as per public transport users request on the phones.

## Development - Manual setup

Before you can build this project, you need the following dependencies:

* [NodeJs](https://nodejs.org/en/) (v v10.11.0) The installation depends on the system you have.

If you are at the AT offices you should clone the repository via HTTPS.

* npm install
* npm start

## Unit test

```
npm run test
```

## Integration test

We use [Cypress](https://www.cypress.io/) to implement the integration test. Run the test environment with the following commands.

Run tests in the terminal.

```
npm run e2e
```

Run tests in the browser, it will open the Cypress app and allow you to run tests by separate.
But for the Cypress browser to be able to run the tests, the application should be running. For that
you should first run this command (this command is defined in a way that the application won't beneeding to login and authenticate. In that case the test cases can run without a problem):
```
npm run start:e2e
```
and then this command:
```
npm run e2e:browser
```

## Code Coverage

```
npm run test:coverage
```

## ESLint
Check the code in the whole application, including test files.

```
npm run eslint
```

## Configuration

### Setup Access Control

The goal is to give different rights to the users in order to activate or disable features.

#### Azure

Firstly, follow [this instruction](https://docs.microsoft.com/en-us/azure/architecture/multitenant-identity/app-roles#roles-using-azure-ad-app-roles) to set up all the user's roles for your application. You have to define them in the application manifest and then assign a role to the each user otherwise they will have the `Default Access` role.

#### App

To run in different environments set NODE_ENV before running.

All the configuration to get the user's role is done in [`index.jsx`](./src/index.jsx). Make sure `REACT_APP_ACTIVE_DIRECTORY_LOGIN_REQUIRED` is set up to `true` and `REACT_APP_ACTIVE_DIRECTORY_CLIENT_ID` is your Azure App one.  
When the app starts, it loads the user from the cache or it forces to log in before starting. Then you can check the user's role with  `authContext.getCachedUser().profile.roles.includes("USER_ROLE")`.


### Environment Variables
| Variable                                      |Type| Description                                         |
|-----------------------------------------------|----|-----------------------------------------------------|
| REACT_APP_AT_FLEET_API_URL                    | string | Fleet API URL                                   |
| REACT_APP_AT_PUBLIC_API_URL                   | string | AT public API URL                               |
| REACT_APP_AT_PUBLIC_API_KEY                   | string | AT public API access key                        |
| REACT_APP_GTFS_REALTIME_SUBSCRIPTIONS_URL     | string | GTFS realtime WebSocket subscription URL        |
| REACT_APP_GTFS_REALTIME_SUBSCRIPTIONS_KEY     | string | GTFS realtime WebSocket subscription access key |
| REACT_APP_GTFS_REALTIME_QUERY_URL             | string | GTFS realtime API URL                           |
| REACT_APP_GTFS_STATIC_QUERY_URL               | string | GTFS static API                                 |
| REACT_APP_CC_STATIC_QUERY_URL                 | string | Command Centre static API URL                   |
| REACT_APP_CC_REALTIME_QUERY_URL               | string | Command Centre realtime API URL                 |
| REACT_APP_BLOCK_MGT_QUERY_URL                 | string | Block management API URL                        |
| REACT_APP_BLOCK_MGT_CLIENT_QUERY_URL          | string | Block management client API URL                 |
| REACT_APP_VEHICLE_ALLOCATION_STREAMING_API_URL| string | Vehicle allocation WebSocket API URL            |
| REACT_APP_TRIP_MGT_QUERY_URL                  | string | Trip management API URL                         |
| REACT_APP_STOP_MESSAGING_API                  | string | Stop messaging API URL                          |
| REACT_APP_DISRUPTION_MGT_QUERY_URL            | string | Disruption management API URL                   |
| REACT_APP_REALTIME_HEALTH_API                 | string | Realtime health API URL                         |
| REACT_APP_ALERTS_API                          | string | Alerts API URL                                  |
| REACT_APP_TRIP_REPLAY_API_URL                 | string | Trip replay API URL                             |
| REACT_APP_ACTIVE_DIRECTORY_TENANT             | string | Active directory tenant                         |
| REACT_APP_ACTIVE_DIRECTORY_LOGIN_REQUIRED     | string | Active directory is required                    |
| REACT_APP_ACTIVE_DIRECTORY_CLIENT_ID          | string | Active directory client ID                      |
| REACT_APP_FEATURE_NOTIFICATIONS               | bool   | Turn on notifications                           |
| REACT_APP_FEATURE_DISRUPTIONS                 | bool   | Turn on disruptions                             |
| REACT_APP_FEATURE_TRIP_REPLAYS                | bool   | Turn on trip replays                            |
| REACT_APP_GOOGLE_TAG_MANAGER_ID               | string | Google Tag Manager ID                           |
