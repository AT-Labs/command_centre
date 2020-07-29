import { expect } from 'chai';
import {
    isTripCancelPermitted, isTripCopyPermitted, isTripDelayPermitted,
    isSkipStopPermitted, isChangeStopPermitted, isGlobalAddBlocksPermitted,
    isIndividualEditBlockPermitted, isIndividualEditStopMessagesPermitted, isGlobalEditStopMessagesPermitted,
} from './user-permissions';
import USER_PERMISSIONS from '../types/user-permissions-types';

const { ROUTES, BLOCKS, STOP_MESSAGING } = USER_PERMISSIONS;

it('isTripCancelPermitted', () => {
    expect(isTripCancelPermitted({})).to.equal(false);
    expect(isTripCancelPermitted({ _links: { permissions: [] } })).to.equal(false);
    expect(isTripCancelPermitted({ _links: { permissions: [{ _rel: ROUTES.CANCEL_TRIP }] } })).to.equal(true);
});

it('isTripCopyPermitted', () => {
    expect(isTripCopyPermitted({})).to.equal(false);
    expect(isTripCopyPermitted({ _links: { permissions: [] } })).to.equal(false);
    expect(isTripCopyPermitted({ _links: { permissions: [{ _rel: ROUTES.COPY_TRIP }] } })).to.equal(true);
});

it('isTripDelayPermitted', () => {
    expect(isTripDelayPermitted({})).to.equal(false);
    expect(isTripDelayPermitted({ _links: { permissions: [] } })).to.equal(false);
    expect(isTripDelayPermitted({ _links: { permissions: [{ _rel: ROUTES.EDIT_TRIP_DELAY }] } })).to.equal(true);
});

it('isSkipStopPermitted', () => {
    expect(isSkipStopPermitted({})).to.equal(false);
    expect(isSkipStopPermitted({ _links: { permissions: [] } })).to.equal(false);
    expect(isSkipStopPermitted({ _links: { permissions: [{ _rel: ROUTES.SKIP_STOP }] } })).to.equal(true);
});

it('isChangeStopPermitted', () => {
    expect(isChangeStopPermitted({})).to.equal(false);
    expect(isChangeStopPermitted({ _links: { permissions: [] } })).to.equal(false);
    expect(isChangeStopPermitted({ _links: { permissions: [{ _rel: ROUTES.CHANGE_STOP }] } })).to.equal(true);
});

it('isGlobalAddBlocksPermitted', () => {
    expect(isGlobalAddBlocksPermitted({})).to.equal(false);
    expect(isGlobalAddBlocksPermitted([])).to.equal(false);
    expect(isGlobalAddBlocksPermitted([{ _rel: BLOCKS.ADD_BLOCK }])).to.equal(true);
});

it('isIndividualEditBlockPermitted', () => {
    expect(isIndividualEditBlockPermitted({})).to.equal(false);
    expect(isIndividualEditBlockPermitted({ _links: { permissions: [] } })).to.equal(false);
    expect(isIndividualEditBlockPermitted({ _links: { permissions: [{ _rel: BLOCKS.EDIT_BLOCK }] } })).to.equal(true);
});

it('isIndividualEditStopMessagesPermitted', () => {
    expect(isIndividualEditStopMessagesPermitted({})).to.equal(false);
    expect(isIndividualEditStopMessagesPermitted({ _links: { permissions: [] } })).to.equal(false);
    expect(isIndividualEditStopMessagesPermitted({ _links: { permissions: [{ _rel: STOP_MESSAGING.EDIT_STOP_MESSAGE }] } })).to.equal(true);
});

it('isGlobalEditStopMessagesPermitted', () => {
    expect(isGlobalEditStopMessagesPermitted({})).to.equal(false);
    expect(isGlobalEditStopMessagesPermitted([])).to.equal(false);
    expect(isGlobalEditStopMessagesPermitted([{ _rel: STOP_MESSAGING.EDIT_STOP_MESSAGE }])).to.equal(true);
});
