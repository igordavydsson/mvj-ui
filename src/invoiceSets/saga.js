// @flow
import {all, call, fork, put, takeLatest} from 'redux-saga/effects';
import {SubmissionError} from 'redux-form';

import {fetchInvoices as fetchInvoicesAction} from '$src/invoices/actions';
import {fetchInvoiceSetsByLease as fetchInvoiceSetsByLeaseAction, notFound, receiveInvoiceSetsByLease} from './actions';
import {receiveError} from '$src/api/actions';
import {getSearchQuery} from '$util/helpers';
import {creditInvoiceSet, fetchInvoiceSetsByLease} from './requests';


function* fetchInvoiceSetsByLeaseSaga({payload: leaseId}): Generator<any, any, any> {
  try {
    const {response: {status: statusCode}, bodyAsJson} = yield call(fetchInvoiceSetsByLease, leaseId);

    switch (statusCode) {
      case 200:
        yield put(receiveInvoiceSetsByLease({leaseId: leaseId, invoiceSets: bodyAsJson.results}));
        break;
      case 404:
        yield put(notFound());
        break;
      case 500:
        yield put(notFound());
        break;
    }
  } catch (error) {
    console.error('Failed to fetch invoice sets with error "%s"', error);
    yield put(notFound());
    yield put(receiveError(error));
  }
}

function* creditInvoiceSetSaga({payload: {creditData, invoiceSetId, lease}}): Generator<any, any, any> {
  try {
    const {response: {status: statusCode}, bodyAsJson} = yield call(creditInvoiceSet, {creditData: creditData, invoiceSetId: invoiceSetId});
    console.log(invoiceSetId);
    switch (statusCode) {
      case 200:
        yield put(fetchInvoicesAction(getSearchQuery({lease: lease})));
        yield put(fetchInvoiceSetsByLeaseAction(lease));
        break;
      case 400:
        yield put(receiveError(new SubmissionError({...bodyAsJson})));
        break;
      case 500:
        yield put(receiveError(new SubmissionError({...bodyAsJson})));
        break;
    }
  } catch (error) {
    console.error('Failed to create invoice with error "%s"', error);
    yield put(receiveError(error));
  }
}

export default function*(): Generator<any, any, any> {
  yield all([
    fork(function*(): Generator<any, any, any> {
      yield takeLatest('mvj/invoiceSets/FETCH_BY_LEASE', fetchInvoiceSetsByLeaseSaga);
      yield takeLatest('mvj/invoiceSets/CREDIT_INVOICESET', creditInvoiceSetSaga);
    }),
  ]);
}
