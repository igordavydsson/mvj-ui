// @flow

import type {Selector} from '../types';
import type {Identifiers, Lease, LeaseState} from './types';

export const getIsFetching: Selector<Lease, void> = (state: Object): LeaseState =>
  state.lease.isFetching;

export const getIdentifiers: Selector<Identifiers, void> = (state: Object): LeaseState =>
  state.lease.identifiers;