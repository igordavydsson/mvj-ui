// @flow
import type {Action} from '$src/types';
import type {LeaseId} from '$src/leases/types';

export type CollectionLetterState = {
  byLease: Object,
  isFetchingByLease: Object,
};
export type CollectionLetterId = number;
export type UploadCollectionLetterPayload = {
  data: {
    lease: LeaseId,
  },
  file: Object,
};
export type DeleteCollectionLetterPayload = {
  id: CollectionLetterId,
  lease: LeaseId,
};

export type FetchCollectionLettersByLeaseAction = Action<'mvj/collectionLetter/FETCH_BY_LEASE', LeaseId>;
export type ReceiveCollectionLettersByLeaseAction = Action<'mvj/collectionLetter/RECEIVE_BY_LEASE', Object>;
export type CollectionLettersNotFoundByLeaseAction = Action<'mvj/collectionLetter/NOT_FOUND_BY_LEASE', LeaseId>;
export type UploadCollectionLetterAction = Action<'mvj/collectionLetter/UPLOAD', UploadCollectionLetterPayload>;
export type DeleteCollectionLetterAction = Action<'mvj/collectionLetter/DELETE', DeleteCollectionLetterPayload>;