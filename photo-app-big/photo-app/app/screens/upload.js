import React from "react";
import {
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image
} from "react-native";
import { f, auth, database, storage } from "../../config/config.js";
import * as ImagePicker from "expo-image-picker";

//add camera
import * as Permissions from "expo-permissions";
//import { on } from "cluster";

class upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedin: false,
      imageId: this.uniqueId(),
      imageSelected: false,
      uploading: false,
      caption: "",
      progress: 0
    };
    //alert(this.uniqueId());
  }
  //add camera permissions
  _checkPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ camera: status });

    const { statusRoll } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ cameraRoll: statusRoll });
  };

  s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  uniqueId = () => {
    return (
      this.s4() +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4()
    );
  };
  //add new image permission to find new image
  findNewImage = async () => {
    this._checkPermissions();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images",
      allowsEditing: true,
      quality: 1
    });

    console.log(result);

    if (!result.cancelled) {
      console.log("upload image");
      this.uploadImage(result.uri);
      this.setState({
        imageSelected: true
      });
    } else {
      console.log("cancel");
    }
  };

  uploadImage = async uri => {
    var that = this;
    var userid = f.auth().currentUser.uid;
    var imageId = this.state.imageId;

    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(uri)[1];
    this.setState({ currentFileType: ext, uploading: true });

    /*const response = await fetch(uri);
    const blob = await response.blob();*/
    var FilePath = imageId + "." + that.state.currentFileType;

    const oReq = new XMLHttpRequest();
    oReq.open("GET", uri, true);
    oReq.responseType = "blob";
    oReq.onload = () => {
      const blob = oReq.response;
      //Call function to complete upload with the new blob to handle the uploadTask.
      this.completeUploadBlob(blob, FilePath);
    };
    oReq.send();

    // const ref = storage.ref("user/" + userid + "/img").child(FilePath);

    // var snapshot = ref.put(blob).on("state_changed", snapshot => {
    //   console.log("Progress", snapshot.bytesTransferred, snapshot.totalBytes);
    // });
  };

  completeUploadBlob = (blob, FilePath) => {
    var that = this;
    var userid = f.auth().currentUser.uid;
    var imageId = this.state.imageId;

    var uploadTask = storage
      .ref("user/" + userid + "/img")
      .child(FilePath)
      .put(blob);

    uploadTask.on(
      "state_changed",
      function(snapshot) {
        var progress = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0);
        console.log("Upload is " + progress + "% complete");
        that.setState({
          progress: progress
        });
      },
      function(error) {
        console.log("error with upload - " + error);
      },
      function() {
        //complete
        that.setState({ progress: 100 });
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log(downloadURL);
          that.processUpload(downloadURL);
        });
      }
    );
  };

  processUpload = imageUrl => {
    //Process here...

    //Set needed info
    var imageId = this.state.imageId;
    var userId = f.auth().currentUser.uid;
    var caption = this.state.caption;
    var dateTime = Date.now();
    var timestamp = Math.floor(dateTime / 1000);
    //Build photo object
    //author, caption, posted, url

    var photoObj = {
      author: userId,
      caption: caption,
      posted: timestamp,
      url: imageUrl
    };

    //Update database

    //Add to main feed
    database.ref("/photos/" + imageId).set(photoObj);

    //Set user photos object
    database.ref("/users/" + userId + "/photos/" + imageId).set(photoObj);

    alert("Image Uploaded!!");

    this.setState({
      uploading: false,
      imageSelected: false,
      caption: "",
      uri: ""
    });
  };

  //end

  componentDidMount = () => {
    var that = this;
    f.auth().onAuthStateChanged(function(user) {
      if (user) {
        //logged in
        that.setState({
          loggedin: true
        });
      } else {
        //not logged in
        that.setState({
          loggedin: false
        });
      }
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.loggedin == true ? (
          //Are logged in

          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 28, paddingBottom: 15 }}>Upload</Text>
            <TouchableOpacity
              onPress={() => this.findNewImage()}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "blue",
                borderRadius: 5
              }}
            >
              <Text style={{ color: "white" }}>Select Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          //Are not logged in
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>You are not logged in</Text>
            <Text>Please login to upload a photo</Text>
          </View>
        )}
      </View>
    );
  }
}

export default upload;
