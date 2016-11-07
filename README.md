# react-firebase-file-uploader
A file uploader for react that uploads images, videos and other files to your firebase storage.

## Props

  * `storageRef` (required) - A reference to the firebase storage folder, where the file should be saved.
  * `onUploadStart` - A callback function that is called with the selected file as its only argument.
  * `onProgress` - A callback function that is called with the progress (between 0 and 100) as its only argument.
  * `onUploadSuccess` - A callback function that is called with the filename of the uploaded file.
  * `onUploadError` - A callback function that is called with a [Firebase error](https://firebase.google.com/docs/storage/web/handle-errors) in case of an error during the upload process.
  * `filename` - The name you would like to give to the file. If not provided, it will use the filename of the file itself or a random generated name if `randomizeFilename` is set to true.
  * `metadata` - An object with the metadata that should be added to the file. You can use this for example to configure caching for your file with `metadata={{cacheControl: 'max-age=3600'}}`.
  * `randomizeFilename` - If true, generates a random filename for your file.
  * `as` - The component you provide in this prop will be rendered instead of the standard html `input`.
  * Default props of a html `input` such as `accept`, `disabled`, `form`, `formNoValidate`, `name`, `readOnly`, `required`, `value`

## Prerequisites
Make sure you have initialized firebase somewhere in your app using:

``` javascript
import firebase from 'firebase';

const config = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  storageBucket: "<BUCKET>.appspot.com",
};
firebase.initializeApp(config);
```

## Example

``` javascript
import React, { Component } from 'react';
import firebase from 'firebase';
import FileUploader from 'react-firebase-file-uploader';

class ProfilePage extends Component {
  state = {
      username: '',
      avatar: '',
      isUploading: false,
      progress: 0,
      avatarURL: ''
  };

  handleChangeUsername = (event) => this.setState({username: event.target.value});
  handleUploadStart = () => this.setState({isUploading: true, progress: 0});
  handleProgress = (progress) => this.setState({progress});
  handleUploadError = (error) => {
      this.setState({isUploading: false});
      console.error(error);
  }
  handleUploadSuccess = (filename) => {
      this.setState({avatar: filename, progress: 100, isUploading: false});
      firebase.storage().ref('images').child(filename).getDownloadURL().then(url => this.setState({avatarURL: url}));
  };

  render() {
    return (
      <div>
        <form>
          <label>Username:</label>
          <input type="text" value={this.state.username} name="username" onChange={this.handleChangeUsername} />
          <label>Avatar:</label>
          {this.state.isUploading &&
            <p>Progress: {this.state.progress}</p>
          }
          {this.state.avatarURL &&
            <img src={this.state.avatarURL} />
          }
          <FileUploader
            accept="image/*"
            name="avatar"
            randomizeFilename
            storageRef={firebase.storage().ref('images')}
            onUploadStart={this.handleUploadStart}
            onUploadError={this.handleUploadError}
            onUploadSuccess={this.handleUploadSuccess}
            onProgress={this.handleProgress}
          />
          <button type="submit" />
        </form>
      </div>
    );
  }
}

export default ProfilePage;
```
