// @flow
import {expect} from 'chai';

import {
  receiveRentForPeriodByLease,
  deleteRentForPeriodByLease,
  fetchRentForPeriodByLease,
  receiveIsSaveClicked,
  notFound,
} from './actions';
import rentForPeriodReducer from './reducer';

import type {RentForPeriodState} from './types';

const defaultState: RentForPeriodState = {
  byLease: {},
  isFetching: false,
  isSaveClicked: false,
};

// $FlowFixMe
describe('Rent for period', () => {

  // $FlowFixMe
  describe('Reducer', () => {

    // $FlowFixMe
    describe('rentForPeriodReducer', () => {

      // $FlowFixMe
      it('should update rent for period list', () => {
        const leaseId = 1;
        const dummyRentForPeriod = {
          id: 1,
          label: 'Foo',
        };
        const newState = {...defaultState, byLease: {[leaseId]: [dummyRentForPeriod]}};

        const state = rentForPeriodReducer({}, receiveRentForPeriodByLease({leaseId: leaseId, rent: dummyRentForPeriod}));
        expect(state).to.deep.equal(newState);
      });

      it('should delete rent for period', () => {
        const leaseId = 1;
        const dummyRentForPeriod = {
          id: 1,
          label: 'Foo',
        };
        const newState = {...defaultState, byLease: {[leaseId]: []}};

        let state = rentForPeriodReducer({}, receiveRentForPeriodByLease({leaseId: leaseId, rent: dummyRentForPeriod}));
        state = rentForPeriodReducer(state, deleteRentForPeriodByLease({leaseId: leaseId, id: 1}));
        expect(state).to.deep.equal(newState);
      });

      it('should update isFetching flag to true when fetching rent for period', () => {
        const newState = {...defaultState, isFetching: true};

        const state = rentForPeriodReducer({}, fetchRentForPeriodByLease({leaseId: 1, id: 5, allowDelete: false, type: 'year', startDate: '2018-12-12', endDate: '2018-12-12'}));
        expect(state).to.deep.equal(newState);
      });

      it('should update isFetching flag to false by notFound', () => {
        const newState = {...defaultState, isFetching: false};

        let state = rentForPeriodReducer({}, fetchRentForPeriodByLease({leaseId: 1, id: 5, allowDelete: false, type: 'year', startDate: '2018-12-12', endDate: '2018-12-12'}));
        state = rentForPeriodReducer(state, notFound());
        expect(state).to.deep.equal(newState);
      });

      it('should update isSaveClicked', () => {
        const newState = {...defaultState, isSaveClicked: true};

        const state = rentForPeriodReducer({}, receiveIsSaveClicked(true));
        expect(state).to.deep.equal(newState);
      });
    });
  });
});
