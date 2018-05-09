// @flow
import {combineReducers} from 'redux';
import {handleActions} from 'redux-actions';

import type {Reducer} from '../types';
import type {
  Attributes,
  ReceiveAttributesAction,
  InvoiceList,
  ReceiveInvoicesAction,
  ReceiveIsCreateOpenAction,
} from './types';

const isFetchingReducer: Reducer<boolean> = handleActions({
  'mvj/leases/CREATE': () => true,
  'mvj/leases/PATCH': () => true,
  'mvj/leases/FETCH_ALL': () => true,
  'mvj/leases/NOT_FOUND': () => false,
  'mvj/leases/RECEIVE_ALL': () => false,
}, false);

const isCreateOpenReducer: Reducer<boolean> = handleActions({
  ['mvj/invoices/RECEIVE_IS_CREATE_OPEN']: (state: boolean, {payload: isOpen}: ReceiveIsCreateOpenAction) => {
    return isOpen;
  },
}, false);

const attributesReducer: Reducer<Attributes> = handleActions({
  ['mvj/invoices/RECEIVE_ATTRIBUTES']: (state: Attributes, {payload: attributes}: ReceiveAttributesAction) => {
    return attributes;
  },
}, {});

const invoicesReducer: Reducer<InvoiceList> = handleActions({
  ['mvj/invoices/RECEIVE_ALL']: (state: InvoiceList, {payload: invoices}: ReceiveInvoicesAction) => {
    return invoices;
  },
}, []);

export default combineReducers({
  attributes: attributesReducer,
  invoices: invoicesReducer,
  isCreateOpen: isCreateOpenReducer,
  isFetching: isFetchingReducer,
});