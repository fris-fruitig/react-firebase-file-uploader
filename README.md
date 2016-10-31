# react-firebase-image-uploader
An image uploader for react that uploads images to your firebase storage.

## Usage
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

You can either use the callbacks of the component:

``` javascript
import React, { Component } from 'react';
import firebase from 'firebase';
import ImageUploader form 'react-firebase-image-uploader';

class ProfilePage extends Component {
    state = {
        username: '',
        avatar: '',
        isUploading: false,
        progress: 0,
        avatarURL: ''
    };

    handleChangeUsername = (event) => this.setState({username: event.target.value});
    handleUploadStart = () => this.setState({isUploading: true, progress: 0};)
    handleProgress = (progress) => this.setState({progress});
    handleUploadError = (error) => {
        this.setState({isUploading: false});
        console.error(error);
    }
    handleUploadSuccess = (filename) => {
        this.setState({avatar: filename, progress: 100, isUploading: false});
        firebase.storage().ref('images').child(filename).getDownloadURL.then(url => this.setState({avatarURL: url}));
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
                    <ImageUploader
                        name="avatar"
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

Or render your component as a child:

``` javascript
import React, { Component } from 'react';
import firebase from 'firebase';
import ImageUploader form 'react-firebase-image-uploader';

class ImageAndProgress extends Component {
    state = {
        url: ''
    };

    componentDidMount() {
        firebase.storage().ref('image').child(this.props.filename).getDownloadURL.then(url => this.setState({url}));
    }

    componentWillReceiveProps(next) {
        if (next.filename !== this.props.filename) {
            firebase.storage().ref('image').child(next.filename).getDownloadURL.then(url => this.setState({url}));
        }
    }

    render() {
        return (
            <div>
                {this.props.isUploading && <p>Progress: {this.props.progress}</p>}
                {this.state.url && <img src={this.state.url} />}
            </div>
        );
    }
}

class ProfilePage extends Component {
    state = {
        username: '',
        avatar: ''
    };

    handleChangeUsername = (event) => this.setState({username: event.target.value});
    handleUploadError = (error) => console.error(error);
    handleUploadSuccess = (filename) => this.setState({avatar: filename});

    render() {
        return (
            <div>
                <form>
                    <label>Username:</label>
                    <input type="text" value={this.state.username} name="username" onChange={this.handleChangeUsername} />
                    <label>Avatar:</label>
                    <ImageUploader
                        name="avatar"
                        storageRef={firebase.storage().ref('images')}
                        onUploadStart={this.handleUploadStart}
                        onUploadError={this.handleUploadError}
                        onUploadSuccess={this.handleUploadSuccess}
                        onProgress={this.handleProgress}
                    >
                        <ImageAndProgress />
                    </ImageUploader>
                    <button type="submit" />
                </form>
            </div>
        );
    }
}

export default ProfilePage;
```
