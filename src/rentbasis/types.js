// @flow

import type {Action, Attributes, Methods} from '$src/types';

export type RentBasisState = {
  attributes: Attributes,
  initialValues: RentBasis,
  isEditMode: boolean,
  isFetching: boolean,
  isFetchingAttributes: boolean,
  isFormValid: boolean,
  isSaveClicked: boolean,
  isSaving: boolean,
  list: RentBasisList,
  methods: Methods,
  rentbasis: RentBasis,
};
export type RentBasisId = number;
export type RentBasis = Object;
export type RentBasisList = Object;

export type FetchAttributesAction = Action<'mvj/rentbasis/FETCH_ATTRIBUTES', void>;
export type ReceiveAttributesAction = Action<'mvj/rentbasis/RECEIVE_ATTRIBUTES', Attributes>;
export type ReceiveMethodsAction = Action<'mvj/rentbasis/RECEIVE_METHODS', Methods>;
export type RentBasisAttributesNotFoundAction = Action<'mvj/rentbasis/ATTRIBUTES_NOT_FOUND', void>;

export type FetchRentBasisListAction = Action<'mvj/rentbasis/FETCH_ALL', string>;
export type ReceiveRentBasisListAction = Action<'mvj/rentbasis/RECEIVE_ALL', RentBasisList>;
export type FetchSingleRentBasisAction = Action<'mvj/rentbasis/FETCH_SINGLE', RentBasisId>;
export type ReceiveSingleRentBasisAction = Action<'mvj/rentbasis/RECEIVE_SINGLE', RentBasis>;
export type CreateRentBasisAction = Action<'mvj/rentbasis/CREATE', RentBasis>;
export type EditRentBasisAction = Action<'mvj/rentbasis/EDIT', RentBasis>;
export type RentBasisNotFoundAction = Action<'mvj/rentbasis/NOT_FOUND', void>;

export type ReceiveIsSaveClickedAction = Action<'mvj/rentbasis/RECEIVE_SAVE_CLICKED', boolean>;

export type HideEditModeAction = Action<'mvj/rentbasis/HIDE_EDIT', void>;
export type ShowEditModeAction = Action<'mvj/rentbasis/SHOW_EDIT', void>;
export type ReceiveRentBasisInitialValuesAction = Action<'mvj/rentbasis/INITIALIZE', RentBasis>;
export type ReceiveFormValidAction = Action<'mvj/rentbasis/RECEIVE_FORM_VALID', boolean>;
