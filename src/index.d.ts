import {Component, ComponentClass} from 'react';

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export interface Props extends Omit<Partial<HTMLInputElement>, 'form'> {
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
}

declare const FirebaseFileUploader: ComponentClass<Props> & {
  // Due to the component class having `ref` methods used in the API,
  // We must add these typings manually
  new (props: Props, context?: any): Component<Props> & {
    startUpload(file: File): void;
    handleFileSelection(event: Object): void;
    removeTask(task: Object): void;
    cancelRunningUploads(): void;
  };
};
export default FirebaseFileUploader;

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
