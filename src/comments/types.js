// @flow

import type {Action} from '../types';

import type {LeaseId} from '$src/leases/types';

export type CommentState = {
  attributes: Attributes,
  byLease: Object,
  isEditModeById: Object,
  isFetching: boolean,
  isSaveClicked: boolean,
};

export type Attributes = Object;
export type Comment = Object;
export type CommentList = Array<Object>;
export type CommentListMap = {[key: string]: Object};
export type CommentId = number;

export type FetchAttributesAction = Action<'mvj/comments/FETCH_ATTRIBUTES', void>;
export type ReceiveAttributesAction = Action<'mvj/comments/RECEIVE_ATTRIBUTES', Attributes>;
export type FetchCommentsByLeaseAction = Action<'mvj/comments/FETCH_BY_LEASE', LeaseId>;
export type ReceiveCommentsByLeaseAction = Action<'mvj/comments/RECEIVE_BY_LEASE', Comment>;

export type CreateCommentAction = Action<'mvj/comments/CREATE', Comment>;
export type EditCommentAction = Action<'mvj/comments/EDIT', Comment>;
export type ClearEditFlagsAction = Action<'mvj/comments/CLEAR_EDIT_FLAGS', void>;
export type HideEditModeByIdAction = Action<'mvj/comments/HIDE_BY_ID', CommentId>;
export type ShowEditModeByIdAction = Action<'mvj/comments/SHOW_BY_ID', CommentId>;

export type ReceiveIsSaveClickedAction = Action<'mvj/comments/RECEIVE_SAVE_CLICKED', boolean>;

export type CommentNotFoundAction = Action<'mvj/comments/NOT_FOUND', void>;
