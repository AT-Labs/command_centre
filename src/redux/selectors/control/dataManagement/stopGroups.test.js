import { uniq } from 'lodash-es';
import { expect } from 'chai';
import sinon from 'sinon';
import { allStopGroupsWithTokens, getAllStopGroups, getDataManagementState, getStopGroupsLoadingState, mergedAllStopGroupsWithTokens } from './stopGroups';

const stopSelectors = require('../stopMessaging/stops');

let sandbox;
const mockState = state => ({
    control: {
        dataManagement: {
            ...state
        },
    },
});

const mockStopGroups = [{
    id:1,
    title:"Test Stop Group 1",
    stops:[
        {value:"120",label:"120 - Mt Albert Train Station"}
    ],
    user:"anon@propellerhead.co.nz",
    timestamp:"2022-02-01T13:01:15+13:00",
    workflowState:"UPDATED",
    testTokens: ["120", "-", "mt", "albert", "train", "station", "test", "stop", "group", "1",],
},
{
    id:2,
    title:"Test Stop Group 2",
    stops:[
        {value:"4569",label:"4569 - Hibiscus Coast Station"}
    ],
    user:"anon@propellerhead.co.nz",
    timestamp:"2022-02-01T13:01:19+13:00",
    workflowState:"UPDATED",
    testTokens: ["4569", "-", "hibiscus", "coast", "station", "test", "stop", "group", "2",],
}];

describe('Data Management Selector', () => {
    beforeEach(() => sandbox = sinon.createSandbox());
    afterEach(() => sandbox.restore());

    context('get state methods', () => {
        it('should return all from state', () => {       
            const mockAllState = {
                stopGroups: [],
                isStopGroupsLoading: false,
            };
            
            expect(getDataManagementState(mockState(mockAllState))).to.deep.equal(mockAllState);
        });

        it('should return all stop groups', () => {       
            const mockAllState = {
                stopGroups: mockStopGroups,
                isStopGroupsLoading: false,
            };
            
            expect(getAllStopGroups(mockState(mockAllState))).to.deep.equal(mockStopGroups);
        });

        it('should return stop groups loading state', () => {       
            const mockAllState = {
                stopGroups: [],
                isStopGroupsLoading: false,
            };
            
            expect(getStopGroupsLoadingState(mockState(mockAllState))).to.equal(false);
        });

        it('should return all Stop Groups With Tokens', () => {
            const mockAllState = {
                stopGroups: mockStopGroups,
                isStopGroupsLoading: false,
            };

            const tokenizedStopGroups = allStopGroupsWithTokens(mockState(mockAllState));

            expect(tokenizedStopGroups.length).to.equal(2);
            expect(tokenizedStopGroups[0].tokens).to.deep.equal(mockStopGroups[0].testTokens);
            expect(tokenizedStopGroups[1].tokens).to.deep.equal(mockStopGroups[1].testTokens);
        });

        it('should return all Stop Groups including system stops groups With Tokens', () => {
            const mockAllState = {
                stopGroups: mockStopGroups,
                isStopGroupsLoading: false,
            };

            const mockStops = [                
                {
                    stop_id: "100-56c57897",
                    stop_name: "Papatoetoe Train Station",
                    stop_code: "100",
                    location_type: 1,
                    stop_lat: -36.97766,
                    stop_lon: 174.84925,
                    parent_station: null,
                    platform_code: null,
                    route_type: 2,
                    parent_stop_code: null,
                    value: "100",
                    label: "100 - Papatoetoe Train Station",
                    testTokens: ["100", "-", "papatoetoe", "train", "station"]
                },
                {
                    stop_id: "2000-99c57897",
                    stop_name: "Britomart Train Station",
                    stop_code: "2000",
                    location_type: 1,
                    stop_lat: -36.87766,
                    stop_lon: 174.94925,
                    parent_station: null,
                    platform_code: null,
                    route_type: 2,
                    parent_stop_code: null,
                    value: "2000",
                    label: "2000 - Britomart Train Station",
                    testTokens: ["2000", "-", "britomart", "train", "station"]
                },
            ];
            sandbox.stub(stopSelectors, 'getAllStops').returns(mockStops);

            const tokenizedStopGroups = mergedAllStopGroupsWithTokens(mockState(mockAllState));
            const mergeTestTokensAllStops = uniq([ ...mockStops[0].testTokens, ...mockStops[1].testTokens ]);
            const mergeTestTokensStopGroups = [ ...uniq(mockStops[1].testTokens), "__", "1000", "to", "8999", "__",];

            expect(tokenizedStopGroups.length).to.equal(4);
            expect(tokenizedStopGroups[0].tokens).to.deep.equal(mockStopGroups[0].testTokens);
            expect(tokenizedStopGroups[1].tokens).to.deep.equal(mockStopGroups[1].testTokens);
            
            expect(tokenizedStopGroups[2].stops.length).to.equal(2);
            expect(tokenizedStopGroups[2].tokens).to.deep.equal([ ...mergeTestTokensAllStops, "__", "all", "stops", "__",]);
            
            expect(tokenizedStopGroups[3].stops.length).to.equal(1);            
            expect(tokenizedStopGroups[3].tokens).to.deep.equal(mergeTestTokensStopGroups);
        });
    });
});



