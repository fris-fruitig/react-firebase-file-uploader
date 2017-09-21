/**
 * FirebaseFileUploader for React
 * @flow
 */

import React, { Component } from 'react';
import { v4 as generateRandomID } from 'uuid';
import resizeAndCropImage from './utils/image';

const generateRandomFilename = (): string => generateRandomID();

function extractExtension(filename: string): string {
  return /(?:\.([^.]+))?$/.exec(filename)[0];
}

export type Props = {
  storageRef: Object,
  onUploadStart?: (file: Object) => void,
  onProgress?: (progress: number) => void,
  onUploadSuccess?: (filename: string) => void,
  onUploadError?: (error: Object) => void,
  filename?: string,
  metadata?: Object,
  randomizeFilename?: boolean,
  as?: any,
  maxWidth?: number,
  maxHeight?: number,
  style?: Object,
  renderButton?: Function,
  // default input props
  id?: string,
  accept?: string,
  disabled?: boolean,
  form?: string,
  formNoValidate?: boolean,
  name?: string,
  readOnly?: boolean,
  required?: boolean,
  value?: string
};

export default class FirebaseFileUploader extends Component<Props> {
  uploadTask: ?Object;

  // Cancel upload if quiting
  componentWillUnmount() {
    this.cancelRunningUpload();
  }

  cancelRunningUpload() {
    if (this.uploadTask) {
      if (this.uploadTask.snapshot.state === 'running') {
        this.uploadTask.cancel();
        this.uploadTask = null;
      }
    }
  }

  startUpload(file: File) {
    // Cancel any running tasks
    this.cancelRunningUpload();

    const {
      onUploadStart,
      storageRef,
      metadata,
      randomizeFilename,
      filename
    } = this.props;

    if (onUploadStart) {
      onUploadStart(file);
    }

    const generateFilename = randomizeFilename
      ? generateRandomFilename : (typeof filename === 'function' && filename);

    let filenameToUse = generateFilename
      ? generateFilename() : (filename || file.name);

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
          return resizeAndCropImage(file, this.props.maxWidth, this.props.maxHeight);
        }
        return file;
      })
      .then(file => {
        this.uploadTask = storageRef.child(filenameToUse).put(file, metadata);
        this.uploadTask.on(
          'state_changed',
          this.progressHandler,
          this.errorHandler,
          this.successHandler
        );
      });
  }

  progressHandler = (snapshot: Object) => {
    const progress = Math.round(
      100 * snapshot.bytesTransferred / snapshot.totalBytes
    );
    if (this.props.onProgress) {
      this.props.onProgress(progress);
    }
  };

  successHandler = () => {
    if (!this.uploadTask) {
      return;
    }
    const filename = this.uploadTask.snapshot.metadata.name;
    if (this.props.onUploadSuccess) {
      this.props.onUploadSuccess(filename);
    }
  };

  errorHandler = (error: Object) => {
    if (this.props.onUploadError) {
      this.props.onUploadError(error);
    }
  };

  handleFileSelection = (event: Object) => {
    const file = event.target.files[0];
    if (file) {
      this.startUpload(file);
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
      as: Input = 'input',
      renderButton,
      ...props
    } = this.props;

    const style = renderButton ? Object.assign({}, props.style, {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1
    }) : props.style;

    const input = <Input type="file" onChange={this.handleFileSelection} {...props} style={style} />;

    return renderButton ? <label style={{display: 'inline-block', cursor: 'pointer'}}>{renderButton()}{input}</label> : input;
  }
}
