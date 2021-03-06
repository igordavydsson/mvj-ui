// @flow

import type {Action} from '../types';

export type DistrictState = {
  byMunicipality: DistrictListMap,
  isFetching: boolean,
};
export type DistrictList = Array<Object>;
export type DistrictListMap = {[key: number]: DistrictList};

export type FetchDistrictsByMunicipalityAction = Action<'mvj/district/FETCH_BY_MUNICIPALITY', number>;
export type ReceiveDistrictsByMunicipalityAction = Action<'mvj/district/RECEIVE_BY_MUNICIPALITY', Object>;
export type DistrictNotFoundAction = Action<'mvj/district/NOT_FOUND', void>;
