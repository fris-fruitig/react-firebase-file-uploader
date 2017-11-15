# react-firebase-file-uploader
A file uploader for react that uploads images, videos and other files to your firebase storage.

__Contents__
- [Props](#props)
- [Prerequisites](#prerequisites)
- [Guide (with examples)](#guide-with-examples)
  - [Basics](#basics)
  - [Rendering a custom button](#rendering-a-custom-button)
  - [Generating a filename](#generating-a-filename)
  - [Uploading multiple files](#uploading-multiple-files)
  - [Preventing the default upload](#preventing-the-default-upload)
  - [Checking the file before upload](#checking-the-file-before-upload)
  - [Preprocessing files](#preprocessing-files)
  - [Passing custom props and event handlers to the input field](#passing-custom-props-and-event-handlers-to-the-input-field)

## Props

  * `storageRef` (required) - A reference to the firebase storage folder, where the file should be saved.
  * `beforeUploadStart` - A callback function that is called with the selected file before the upload. This function can be used to check if the file is valid for upload and to preprocess the file. The function is allowed to return a promise. If the promise is rejected or an error is thrown in the function, the upload won't start and the `onUploadError` callback will be called with the error. If nothing is thrown/rejected, the returned or resolved file will be used for the upload. If nothing is returned or resolved by the function, the unaltered file will be uploaded.
  * `onUploadStart` - A callback function that is called with the selected file (or processed file if the file was altered in beforeUploadStart) as its first argument and the upload task as its second argument.
  * `onProgress` - A callback function that is called with the progress (between 0 and 100) as its first argument and the upload task as its second argument.
  * `onUploadSuccess` - A callback function that is called with the filename of the uploaded file as its first argument and the upload task as its second argument.
  * `onUploadError` - A callback function that is called with a [Firebase error](https://firebase.google.com/docs/storage/web/handle-errors) in case of an error during the upload process.
  * `filename` - The name you would like to give to the file. This can either be a function or a string. If a function is provided, it will be called with the selected file as its first and only argument. If no value is provided, it will use the filename of the file itself or a random generated name if `randomizeFilename` is set to true.
  * `metadata` - An object with the metadata that should be added to the file. You can use this for example to configure caching for your file with `metadata={{cacheControl: 'max-age=3600'}}`.
  * `randomizeFilename` - If true, generates a random filename for your file.
  * `hidden` - If true the rendered html input element will be hidden. This is useful if you want to [render a custom button](#rendering-a-custom-button).
  * `as` - The component you provide in this prop will be rendered instead of the standard html `input`.
  * Default props of a html `input` such as `accept`, `disabled`, `form`, `formNoValidate`, `name`, `readOnly`, `required`, `value`, `multiple`.

## Prerequisites
Make sure you have initialized firebase somewhere in your app using:

``` jsx
import firebase from 'firebase';

const config = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  storageBucket: "<BUCKET>.appspot.com",
};
firebase.initializeApp(config);
```

## Guide (with examples)

### Basics

``` jsx
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
        </form>
      </div>
    );
  }
}

export default ProfilePage;
```

### Rendering a custom button
Most of the times the default html input element doesn't look very nice. There are two ways in which you can render a custom button:

#### Wrapping the input in a label
You can render a custom button by wrapping the upload component in a `label` as follows:
``` jsx
...
  <label style={{backgroundColor: 'steelblue', color: 'white', padding: 10, borderRadius: 4, cursor: 'pointer'}}>
    Select your awesome avatar
    <FileUploader
      hidden
      accept="image/*"
      storageRef={firebase.storage().ref('images')}
      onUploadStart={this.handleUploadStart}
      onUploadError={this.handleUploadError}
      onUploadSuccess={this.handleUploadSuccess}
      onProgress={this.handleProgress}
    />
  </label>
...
```
Please note that you will need to provide the `hidden` prop to hide the default html input element.

The above code will render this:

![Custom Button](assets/custom-button.png)

#### Using the `CustomUploadButton` component
There is a littel helper component that you can find in `'react-firebase-file-uploader/lib/CustomUploadButton'`. This component will wrap the input in a label for you and automatically adds the `pointer` type for the cursor and the `htmlFor` prop based on the id that you provide. The label can be styled using the `style` or `className` prop like this:

``` jsx
...
import CustomUploadButton from 'react-firebase-file-uploader/lib/CustomUploadButton';
...
  <CustomUploadButton
    accept="image/*"
    storageRef={firebase.storage().ref('images')}
    onUploadStart={this.handleUploadStart}
    onUploadError={this.handleUploadError}
    onUploadSuccess={this.handleUploadSuccess}
    onProgress={this.handleProgress}
    style={{backgroundColor: 'steelblue', color: 'white', padding: 10, borderRadius: 4}}
  >
    Select your awesome avatar
  </CustomUploadButton>
...

```
This will result in the same rendered button as the [wrap example](#wrapping-the-input-in-a-label).

### Generating a filename
If you would like to generate a filename yourself you can provide a function as `filename` attribute:

``` jsx
...
  <FileUploader
    accept="image/*"
    name="avatar"
    filename={file => this.state.username + file.name.split('.')[1]; }
    storageRef={firebase.storage().ref('images')}
    onUploadStart={this.handleUploadStart}
    onUploadError={this.handleUploadError}
    onUploadSuccess={this.handleUploadSuccess}
    onProgress={this.handleProgress}
  />
...
```

In the example above, the filename is generated by is naively (do not use in production!) extracting the file extension from the selected file and placing it after the username, such that the resulting filename will be `johndoe.jpg` if the username were `johndoe` and the extension of the selected file `.jpg`.

### Uploading multiple files
If you provide the `multiple` prop to the input, this will allow a user to select and upload multiple files at once . All callbacks will be called with the upload task as second argument. You can use this task to discriminate between the uploaded files, for example by using the path in `task.snapshot.ref.fullPath` as identifier for the upload.

### Preventing the default upload
By default this component will upload files immediately. Because of this, you can always be sure that the file is uploaded before a submitting a form, etc. However, sometimes this is not the desired behavior. If you would like to stay in contorl, you can provide a custom `onChange` handler as property to the uploader. You can than manually trigger the upload using `this.uploader.startUpload(file)`. For this to work you'll need to save a reference to the uploader:

``` jsx
import React, { Component } from 'react';
import { render } from 'react-dom';
import firebase from 'firebase';
import config from './firebase-config.json'; // provide your firebase credentials in this file
import FileUploader from 'react-firebase-file-uploader';

firebase.initializeApp(config);

class Example extends Component {
  state = {}

  handleChangeImage = (e) => {
    const image = e.target.files[0];
    if (image) {
      this.setState({image});
    }
  };

  handleUploadSuccess = (filename) => {
    // Do something with the name of the uploaded file and possibly the rest of the form
    firebase.database().ref('images').push({filename});
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.uploader && this.state.image) {
      this.uploader.startUpload(this.state.image);
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>Image:</label>
        <FileUploader
          ref={c => { this.uploader = c; }}
          accept="image/*"
          storageRef={firebase.storage().ref('images')}
          onChange={this.handleChangeImage}
          onUploadSuccess={this.handleUploadSuccess}
        />
        <button type="submit" />
      </form>
    );
  }
}

render(
  <Example />,
  document.getElementById('root')
);

```

### Checking the file before upload
As mentioned in the [Props](#props) section, the uploader accepts a `beforeUploadStart` property. You can use this to check a file before uploading and cancel the upload if the file is not accepted.

Quick example with a maximum file size:

``` jsx
import React, { Component } from 'react';
import { render } from 'react-dom';
import firebase from 'firebase';
import config from './firebase-config.json'; // provide your firebase credentials in this file
import FileUploader from 'react-firebase-file-uploader';

firebase.initializeApp(config);

// The following will also work:
// const checkFileSize = file => {
//   if (file.size >= 5*1024*1024) throw new Error('Too big')
// }
const checkFileSize = file =>
  new Promise(
    (resolve, reject) =>
      file.size >= 5 * 1024 * 1024
        ? reject(new Error("Too big"))
        : resolve(file)
  );

class Example extends Component {
  state = {};

  handleUploadStart = () => {
    this.setState({ error: null, isUploading: true });
  };

  handleUploadError = error => {
    this.setState({
      error:
        error.message === "Too big"
          ? "The image you picked is larger than 5 MB, please choose a smaller image."
          : "Something went wrong, please try again with a different file.",
      isUploading: false
    });
  };

  handleUploadSuccess = filename => {
    firebase
      .database()
      .ref("images")
      .push({ filename });
    this.setState({ isUploading: false });
  };

  render() {
    return (
      <form>
        <label>Image:</label>
        <FileUploader
          accept="image/*"
          storageRef={firebase.storage().ref("images")}
          beforeUploadStart={checkFileSize}
          onUploadStart={this.handleUploadStart}
          onUploadError={this.handleUploadError}
          onUploadSuccess={this.handleUploadSuccess}
        />
        {!!this.state.error && (
          <p style={{ color: "red" }}>{this.state.error}</p>
        )}
        <button disabled={this.state.isUploading} type="submit" />
      </form>
    );
  }
}

render(<Example />, document.getElementById("root"));
```

### Preprocessing files
As you can see in the previous example, the function provided as `beforeUploadStart` property can resolve a file. It is also allowed to return/resolve a blob instead. This file/blob will then be uploaded.

You can use this functionality to preprocess a file. Below a short example to crop/resize images. This functionality used to be available out of the box. Now you'll have to manually perform this step in the function provided as `beforeUploadStart`. To aid you, the preprocessor that used to do this is still available at `'react-firebase-file-uploader/lib/preprocessors/resizeAndCropImage'`. I am hoping to add more preprocessors/plugins in the future.

``` jsx
import React, { Component } from 'react';
import { render } from 'react-dom';
import firebase from 'firebase';
import config from './firebase-config.json'; // provide your firebase credentials in this file
import FileUploader from 'react-firebase-file-uploader';
import resizeAndCropImage from 'react-firebase-file-uploader/lib/preprocessors/resizeAndCropImage';

firebase.initializeApp(config);

const maxWidth = 300;
const maxHeight = 300;
const processImage = file => resizeAndCropImage(file, maxWidth, maxHeight)

class Example extends Component {
  state = {};

  handleUploadStart = () => {
    this.setState({ error: null, isUploading: true });
  };

  handleUploadError = error => {
    this.setState({
      error: error.message
    });
  };

  handleUploadSuccess = filename => {
    firebase
      .database()
      .ref("images")
      .push({ filename });
    this.setState({ isUploading: false });
  };

  render() {
    return (
      <form>
        <label>Image:</label>
        <FileUploader
          accept="image/*"
          storageRef={firebase.storage().ref("images")}
          beforeUploadStart={processImage}
          onUploadStart={this.handleUploadStart}
          onUploadError={this.handleUploadError}
          onUploadSuccess={this.handleUploadSuccess}
        />
        {!!this.state.error && (
          <p style={{ color: "red" }}>{this.state.error}</p>
        )}
        <button disabled={this.state.isUploading} type="submit" />
      </form>
    );
  }
}

render(<Example />, document.getElementById("root"));
```

### Passing custom props and event handlers to the input field
All properties that are not mentioned in the [Props](#props), with exception of `style`, section will be passed to the input component itself. This means that you can add custom event listeners, etc.

For example if you render the uploader in another clickable component, you might want to stop propagation of click events. To achieve this you can just provide an `onClick` handler to the uploader like this:

``` jsx
...
  <FileUploader
    onClick={e => e.stopPropagation()}
    storageRef={firebase.storage().ref("images")}
    onUploadStart={this.handleUploadStart}
    onUploadError={this.handleUploadError}
    onUploadSuccess={this.handleUploadSuccess}
  />
...
```