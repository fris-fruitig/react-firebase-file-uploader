/**
 * FirebaseFileUploader for React
 * @flow
 */

import React, { Component } from 'react';
import { v4 as generateID } from 'uuid';
import './polyfill'; // polyfill for canvas.toBlob function

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
  maxWidth?: number,
  maxHeight?: number,
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

	startUpload(file: File) {
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

    Promise.resolve().then(() => {
      const shouldResize = file.type.match(/image.*/) && (this.props.maxWidth || this.props.maxHeight);
      if (shouldResize) {
        return this.resizeAndCropImage(file);
      }
      return file;
    })
      .then(file => {
        this.uploadTask = storageRef.child(filenameToUse).put(file, metadata);
        this.uploadTask.on('state_changed',
          this.progressHandler,
          this.errorHandler,
          this.successHandler,
        );
      })
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

  resizeAndCropImage(file: File) {
    return new Promise((resolve, reject) => {
      // Create file reader
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        // Create image object
        const image = new Image();
        image.onload = (imageEvent) => {
          // Create canvas or use provided canvas
          const canvas = document.createElement('canvas');
          const maxWidth = this.props.maxWidth || image.width;
          const maxHeight = this.props.maxHeight || image.height;
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          // Calculate scaling
          const horizontalScale = maxWidth / image.width;
          const verticalScale = maxHeight / image.height;
          const scale = Math.max(horizontalScale, verticalScale);
          // Calculate cropping
          const [width, height] = [scale * image.width, scale * image.height];
          const verticalOffset = Math.min((maxHeight - height) / 2, 0);
          const horizontalOffset = Math.min((maxWidth - width) / 2, 0);
          // Obtain the context for a 2d drawing
          const context = canvas.getContext('2d');
          if (!context) {
            return reject('Could not get the context of the canvas element');
          }
          // Draw the resized and cropped image
          context.drawImage(image, horizontalOffset, verticalOffset, width, height);
          canvas.toBlob((blob) => {
            resolve(blob);
          }, file.type);
        }
        image.src = readerEvent.target.result;
      }
      reader.readAsDataURL(file);
    });
  }

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