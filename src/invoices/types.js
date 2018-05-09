// @flow

import type {Action} from '../types';

export type InvoiceState = Object;
export type Attributes = Object;
export type Invoice = Object;
export type InvoiceList = Array<Object>;

export type FetchAttributesAction = Action<'mvj/invoices/FETCH_ATTRIBUTES', void>;
export type ReceiveAttributesAction = Action<'mvj/invoices/RECEIVE_ATTRIBUTES', Attributes>;

export type FetchInvoicesAction = Action<'mvj/invoices/FETCH_ALL', string>;
export type ReceiveInvoicesAction = Action<'mvj/invoices/RECEIVE_ALL', InvoiceList>;
export type CreateInvoiceAction = Action<'mvj/invoices/CREATE', Invoice>;
export type PatchInvoiceAction = Action<'mvj/invoices/PATCH', Invoice>;

export type InvoiceNotFoundAction = Action<'mvj/invoices/NOT_FOUND', void>;

export type ReceiveIsCreateOpenAction = Action<'mvj/invoices/RECEIVE_IS_CREATE_OPEN', boolean>;