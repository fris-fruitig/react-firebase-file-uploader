/**
 * @flow
 */

declare type FirebaseStorageErrorCode = 'storage/unknown'
  | 'storage/object_not_found'
  | 'storage/bucket_not_found'
  | 'storage/project_not_found'
  | 'storage/quota_exceeded'
  | 'storage/unauthenticated'
  | 'storage/unauthorized'
  | 'storage/retry_limit_exceeded'
  | 'storage/invalid_checksum'
  | 'storage/canceled'
  | 'storage/invalid_event_name'
  | 'storage/invalid_url'
  | 'storage/invalid-argument'
  | 'storage/no_default_bucket'
  | 'storage/cannot_slice_blob'
  | 'storage/server_wrong_file_size'

declare type FirebaseStorageError = {
  code: FirebaseStorageErrorCode,
  message: string,
  name: string,
  stack: string
};
