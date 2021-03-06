// @flow
import {expect} from 'chai';

import {
  receiveInvoiceSetsByLease,
  fetchInvoiceSetsByLease,
  notFound,
} from './actions';
import invoiceSetsReducer from './reducer';

import type {InvoiceSetState} from './types';

const defaultState: InvoiceSetState = {
  byLease: {},
  isFetching: false,
};

// $FlowFixMe
describe('Invoice sets', () => {

  // $FlowFixMe
  describe('Reducer', () => {

    // $FlowFixMe
    describe('invoiceSetsReducer', () => {

      // $FlowFixMe
      it('should update invoice sets', () => {
        const leaseId = 1;
        const dummyInvoiceSets = [
          {
            id: 1,
            label: 'Foo',
          },
        ];
        const newState = {...defaultState, byLease: {[leaseId]: dummyInvoiceSets}};

        const state = invoiceSetsReducer({}, receiveInvoiceSetsByLease({leaseId: leaseId, invoiceSets: dummyInvoiceSets}));
        expect(state).to.deep.equal(newState);
      });

      it('should update isFetching flag to true when fetching invoice sets', () => {
        const newState = {...defaultState, isFetching: true};

        const state = invoiceSetsReducer({}, fetchInvoiceSetsByLease(1));
        expect(state).to.deep.equal(newState);
      });

      it('should update isFetching flag to false by notFound', () => {
        const newState = {...defaultState, isFetching: false};

        let state = invoiceSetsReducer({}, fetchInvoiceSetsByLease(1));
        state = invoiceSetsReducer(state, notFound());
        expect(state).to.deep.equal(newState);
      });
    });
  });
});
