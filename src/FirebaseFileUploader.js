/**
 * FirebaseFileUploader for React
 * @flow
 */

import React, { Component } from 'react';
import { v4 as generateID } from 'uuid';

function generateRandomFilename(currentFilename: string): string {
	const extension = /(?:\.([^.]+))?$/.exec(currentFilename)[0];
  return generateID() + extension;
}

type Props = {
	storageRef: Object,
	onUploadStart?: (file: Object) => void,
	onProgress?: (progress: number) => void,
	onUploadSuccess?: (filename: string) => void,
	onUploadError?: (error: FirebaseStorageError) => void,
  filename?: string,
  metadata?: Object,
  randomizeFilename?: boolean,
  as?: any,
  // default input props
  accept?: string,
  disabled?: boolean,
  form?: string,
  formNoValidate?: boolean,
  name?: string,
  readOnly?: boolean,
  required?: boolean,
  value?: string,
};

export default class FirebaseFileUploader extends Component {
	props: Props;
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
	};

	startUpload(file: Object) {
		// Cancel any running tasks
		this.cancelRunningUpload();

    const {
      onUploadStart,
      storageRef,
      metadata,
      randomizeFilename,
      filename,
    } = this.props;

		if (onUploadStart) {
			onUploadStart(file);
		}

    const currentFilename = filename || file.name;
    const filenameToUse = randomizeFilename ? generateRandomFilename(currentFilename) : currentFilename;

    this.uploadTask = storageRef.child(filenameToUse).put(file, metadata);
		this.uploadTask.on('state_changed',
      this.progressHandler,
      this.errorHandler,
      this.successHandler,
    );
	};

	progressHandler = (snapshot: Object) => {
		const progress = Math.round(100 * snapshot.bytesTransferred / snapshot.totalBytes);
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

	errorHandler = (error: FirebaseStorageError) => {
		if (this.props.onUploadError) {
			this.props.onUploadError(error);
		}
	};

	handleFileSelection = (event: Object) => {
    if (event.target.files[0]) {
		  this.startUpload(event.target.files[0]);
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
      as,
      ...props,
		} = this.props;

    if (as) {
      const Input = as;
      return (
        <Input
          onChange={this.handleFileSelection}
          {...props}
        />
      );
    }
    return (
      <input
        type="file"
        onChange={this.handleFileSelection}
        {...props}
      />
    );
	}
}