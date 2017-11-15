/**
 * FirebaseFileUploader for React
 * @flow
 */

import React, { Component } from 'react';
import { v4 as generateRandomID } from 'uuid';

const generateRandomFilename = (): string => generateRandomID();

function extractExtension(filename: string): string {
  return /(?:\.([^.]+))?$/.exec(filename)[0];
}

export type Props = {
  storageRef: Object,
  beforeUploadStart?: (file: File) => Promise<File | Blob>,
  onUploadStart?: (file: File | Blob, task: Object) => void,
  onProgress?: (progress: number, task: Object) => void,
  onUploadSuccess?: (filename: string, task: Object) => void,
  onUploadError?: (error: Object, task?: Object) => void,
  filename?: string | ((file: File) => string),
  metadata?: Object,
  randomizeFilename?: boolean,
  as?: any,
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
      beforeUploadStart = file => file,
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
      filenameToUse =
        typeof filename === 'function' ? filename(file) : filename;
    } else {
      filenameToUse = randomizeFilename ? generateRandomFilename() : file.name;
    }

    // Ensure there is an extension in the filename
    if (!extractExtension(filenameToUse)) {
      filenameToUse += extractExtension(file.name);
    }

    Promise.resolve(file)
      .then(beforeUploadStart)
      .then((preprocessedFile = file) => {
        const task = storageRef
          .child(filenameToUse)
          .put(preprocessedFile, metadata);

        if (onUploadStart) {
          onUploadStart(preprocessedFile, task);
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
      }, onUploadError);
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
      beforeUploadStart,
      onUploadStart,
      onProgress,
      onUploadSuccess,
      onUploadError,
      randomizeFilename,
      metadata,
      filename,
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
