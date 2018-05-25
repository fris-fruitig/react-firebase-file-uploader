/**
 * FirebaseFileUploader for React
 * @flow
 */

import React, { Component } from 'react';
import generateRandomID from 'uuid/v4';
import resizeAndCropImage from './utils/image';

const generateRandomFilename = (): string => generateRandomID();

function extractExtension(filename: string): string {
  return /(?:\.([^.]+))?$/.exec(filename)[0];
}

export type Props = {
  storageRef: Object,
  onUploadStart?: (file: Object, task: Object) => void,
  onProgress?: (progress: number, task: Object) => void,
  onUploadSuccess?: (filename: string, task: Object) => void,
  onUploadError?: (error: Object, task: Object) => void,
  filename?: string | (file: File) => string,
  metadata?: Object,
  randomizeFilename?: boolean,
  as?: any,
  maxWidth?: number,
  maxHeight?: number,
  style?: Object,
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
};

export default class FirebaseFileUploader extends Component<Props> {
  uploadTasks: Array<Object> = [];

  // Cancel all running uploads before unmount
  componentWillUnmount() {
    this.cancelRunningUploads();
  }

  cancelRunningUploads() {
    while (this.uploadTasks.length > 0) {
      const task = this.uploadTasks.pop();
      if (task.snapshot.state === 'running') {
        task.cancel();
      }
    }
  }

  // Remove a specific task from the uploadTasks
  removeTask(task: Object) {
    for (let i = 0; i < this.uploadTasks.length; i++) {
      if (this.uploadTasks[i] === task) {
        this.uploadTasks.splice(i, 1);
        return;
      }
    }
  }

  startUpload(file: File) {
    const {
      onUploadStart,
      onProgress,
      onUploadError,
      onUploadSuccess,
      storageRef,
      metadata,
      randomizeFilename,
      filename
    } = this.props;

    let filenameToUse;
    if (filename) {
      filenameToUse = typeof filename === 'function' ? filename(file) : filename;
    }
    else {
      filenameToUse = randomizeFilename ? generateRandomFilename() : file.name;
    }

    // Ensure there is an extension in the filename
    if (!extractExtension(filenameToUse)) {
      filenameToUse += extractExtension(file.name);
    }

    Promise.resolve()
      .then(() => {
        const shouldResize =
          file.type.match(/image.*/) &&
          (this.props.maxWidth || this.props.maxHeight);
        if (shouldResize) {
          return resizeAndCropImage(
            file,
            this.props.maxWidth,
            this.props.maxHeight
          );
        }
        return file;
      })
      .then(file => {
        const task = storageRef.child(filenameToUse).put(file, metadata);

        if (onUploadStart) {
          onUploadStart(file, task);
        }

        task.on(
          'state_changed',
          snapshot =>
            onProgress &&
            onProgress(
              Math.round(100 * snapshot.bytesTransferred / snapshot.totalBytes),
              task
            ),
          error => onUploadError && onUploadError(error, task),
          () => {
            this.removeTask(task);
            return (
              onUploadSuccess &&
              onUploadSuccess(task.snapshot.metadata.name, task)
            );
          }
        );
        this.uploadTasks.push(task);
      });
  }

  handleFileSelection = (event: Object) => {
    const { target: { files } } = event;
    for (let i = 0; i < files.length; i++) {
      this.startUpload(files[i]);
    }
  };

  render() {
    const {
      storageRef,
      onUploadStart,
      onProgress,
      onUploadSuccess,
      onUploadError,
      randomizeFilename,
      metadata,
      filename,
      maxWidth,
      maxHeight,
      hidden,
      as: Input = 'input',
      ...props
    } = this.props;

    const inputStyle = hidden
      ? Object.assign({}, props.style, {
          width: '0.1px',
          height: '0.1px',
          opacity: 0,
          overflow: 'hidden',
          position: 'absolute',
          zIndex: -1
        })
      : props.style;

    return (
      <Input
        type="file"
        onChange={this.handleFileSelection}
        {...props}
        style={inputStyle}
      />
    );
  }
}
