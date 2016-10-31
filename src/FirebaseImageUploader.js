/**
 * FirebaseImageUploader for React
 * @flow
 */

import React, { Component } from 'react';

import { v4 as generateID } from 'uuid';

type StorageErrorCode = 'storage/unknown'
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

export type FirebaseStorageError = {
	code: StorageErrorCode,
	message: string,
	name: string,
	stack: string
};

type Props = {
	storageRef: Object,
	onUploadStart?: (file: Object) => void,
	onProgress?: (progress: number) => void,
	onUploadSuccess?: (filename: string) => void,
	onUploadError?: (error: FirebaseStorageError) => void,
	name?: string,
	children?: any
};

type State = {
	isUploading?: boolean,
	filename?: string,
	progress?: number
};

function generateImageName(fileName: string): string {
	// Define file data
	const extension = /(?:\.([^.]+))?$/.exec(fileName)[0];
	const imageName = generateID() + extension;
	return imageName;
}

export default class FirebaseImageUploader extends Component {
	props: Props;
	state: State = {};

	uploadTask: ?Object;

	// Cancel upload if quiting
	componentWillUnmount() {
		this.cancelRunningUpload();
	}

	cancelRunningUpload = () => {
		if (this.uploadTask) {
			if (this.uploadTask.snapshot.state === 'running') {
				this.uploadTask.cancel();
				this.uploadTask = null;
			}
		}
	};

	handleImageSelection = (event: Object) => {
		this.handleUploadStart(event.target.files[0]);
	};

	handleUploadStart = (file: Object) => {

		// Cancel any running tasks
		this.cancelRunningUpload();

		if (this.props.onUploadStart) {
			this.props.onUploadStart(file);
		}

		this.setState({ isUploading: true, progress: 0 });

		// upload file
		const imageName = generateImageName(file.name);
		this.uploadTask = this.props.storageRef.child(imageName).put(file)
		// Listen for progress
		this.uploadTask.on('state_changed',
			snapshot => this.handleProgress(snapshot),
			error => this.handleUploadError(error),
			() => this.handleUploadSuccess()
		);
	};

	handleProgress = (snapshot: Object) => {
		const progress = Math.round(100 * snapshot.bytesTransferred / snapshot.totalBytes);
		if (this.props.onProgress) {
			this.props.onProgress(progress);
		}
		this.setState({ progress });
	};

	handleUploadSuccess = () => {
		if (!this.uploadTask) {
			return;
		}
		const filename = this.uploadTask.snapshot.metadata.name;
		if (this.props.onUploadSuccess) {
			this.props.onUploadSuccess(filename);
		}
		this.setState({ filename, isUploading: false, progress: 100 });
	};

	handleUploadError = (error: FirebaseStorageError) => {
		if (this.props.onUploadError) {
			this.props.onUploadError(error);
		}
	};

	render() {
		const {
			name
		} = this.props;
		return (
			<div>
				{React.Children.map(this.props.children, (child => React.cloneElement(child, {...this.state})))}
				<input
					name={name}
					type="file"
					accept="image/*"
					onChange={this.handleImageSelection}
				/>
			</div>
		);
	}
}