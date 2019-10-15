import {Component, ComponentState, Context,ValidationMap, WeakValidationMap, ChangeEventHandler} from 'react';

export interface Props {
  storageRef: Object,
  onUploadStart?: (file: Object, task: Object) => void,
  onProgress?: (progress: number, task: Object) => void,
  onUploadSuccess?: (filename: string, task: Object) => void,
  onUploadError?: (error: Object, task: Object) => void,
  filename?: string | ((file: File) => string),
  metadata?: Object,
  randomizeFilename?: boolean,
  as?: any,
  maxWidth?: number,
  maxHeight?: number,
  hidden?: boolean,
  // default input props
  id?: string,
  accept?: string,
  disabled?: boolean,
  form?: string,
  formNoValidate?: boolean,
  name?: string,
  readOnly?: boolean,
  required?: boolean,
  value?: string,
  multiple?: boolean
  onChange?: ChangeEventHandler
}

interface FileUploaderMethods {
  startUpload(file: File): void;
  handleFileSelection(event: Object): void;
  removeTask(task: Object): void;
  cancelRunningUploads(): void;
}

type FileUploaderType = {
  // This was cloned from the @react/types typings.
  // There does not currently seem to be a good way to append methods to the `ref` of a component otherwise
  new(props: Props, context?: any): Component<Props, ComponentState> & FileUploaderMethods;
  propTypes?: WeakValidationMap<Props>;
  contextType?: Context<any>;
  contextTypes?: ValidationMap<any>;
  childContextTypes?: ValidationMap<any>;
  defaultProps?: Partial<Props>;
  displayName?: string;
};

export default FileUploaderType;

export type FirebaseStorageErrorCode =
  | "storage/unknown"
  | "storage/object_not_found"
  | "storage/bucket_not_found"
  | "storage/project_not_found"
  | "storage/quota_exceeded"
  | "storage/unauthenticated"
  | "storage/unauthorized"
  | "storage/retry_limit_exceeded"
  | "storage/invalid_checksum"
  | "storage/canceled"
  | "storage/invalid_event_name"
  | "storage/invalid_url"
  | "storage/invalid-argument"
  | "storage/no_default_bucket"
  | "storage/cannot_slice_blob"
  | "storage/server_wrong_file_size";

export interface FirebaseStorageError {
  code: FirebaseStorageErrorCode;
  message: string;
  name: string;
  stack: string;
}
