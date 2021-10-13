import React, { useState, useEffect } from "react";
import { Platform, View } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { getFileObjectAsync, uuid } from "../../../Utils";

// See https://github.com/mmazzarolo/react-native-modal-datetime-picker
// Most of the date picker code is directly sourced from the example.
import DateTimePickerModal from "react-native-modal-datetime-picker";

// See https://docs.expo.io/versions/latest/sdk/imagepicker/
// Most of the image picker code is directly sourced from the example.
import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../models/social";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewSocialScreen">;
}

export default function NewSocialScreen({ navigation }: Props) {
  /* TODO: Declare state variables for all of the attributes 
           that you need to keep track of on this screen.
    
     HINTS:

      1. There are five core attributes that are related to the social object.
      2. There are two attributes from the Date Picker.
      3. There is one attribute from the Snackbar.
      4. There is one attribute for the loading indicator in the submit button.
  
  */
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventImage, setEventImage] = useState("");

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDateSelected, setDateSelected] = useState(false);

  const [isSnackbarVisible, setSnackbarVisibility] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // TODO: Follow the Expo Docs to implement the ImagePicker component.
  // https://docs.expo.io/versions/latest/sdk/imagepicker/

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setEventImage(result.uri);
    }
  };

  // TODO: Follow the GitHub Docs to implement the react-native-modal-datetime-picker component.
  // https://github.com/mmazzarolo/react-native-modal-datetime-picker

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setDateSelected(true);
  };

  // TODO: Follow the SnackBar Docs to implement the Snackbar component.
  // https://callstack.github.io/react-native-paper/snackbar.html

  const onToggleSnackBar = () => setSnackbarVisibility(!isSnackbarVisible);
  const onDismissSnackBar = () => setSnackbarVisibility(false);

  const saveEvent = async () => {
    // TODO: Validate all fields (hint: field values should be stored in state variables).
    // If there's a field that is missing data, then return and show an error
    // using the Snackbar.
    console.log("saving event");
    // Otherwise, proceed onwards with uploading the image, and then the object.

    try {
      const asyncAwaitNetworkRequests = async () => {
        const object = await getFileObjectAsync(eventImage);
        const result = await firebase
          .storage()
          .ref()
          .child(uuid() + ".jpg")
          .put(object as Blob);
        const downloadURL = await result.ref.getDownloadURL();
        const doc: SocialModel = {
          eventName: eventName,
          eventDate: eventDate.getTime(),
          eventLocation: eventLocation,
          eventDescription: eventDescription,
          eventImage: downloadURL,
        };
        await firebase.firestore().collection("socials").doc().set(doc);
        console.log("Finished social creation.");
      };
      asyncAwaitNetworkRequests()
        .then(() => {
          console.log("our async function finished running.");
          navigation.navigate("Main");
        })
        .catch((e) => {
          console.log("our async function threw an error:", e);
        });
    } catch (e) {
      console.log("Error while writing social:", e);
    }
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="Socials" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 15 }}>
        {/* TextInput */}
        <TextInput
          label={"Event Name"}
          mode={"flat"}
          onChangeText={(text) => setEventName(text)}
          style={{ marginTop: 5, marginBottom: 5 }}
        />

        {/* TextInput */}
        <TextInput
          label={"Event Location"}
          mode={"flat"}
          onChangeText={(text) => setEventLocation(text)}
          style={{ marginTop: 5, marginBottom: 5 }}
        />

        {/* TextInput */}
        <TextInput
          label={"Event Description"}
          mode={"flat"}
          onChangeText={(text) => setEventDescription(text)}
          style={{ marginTop: 5, marginBottom: 5 }}
        />

        {/* Button */}
        <Button
          onPress={showDatePicker}
          mode="outlined"
          style={{ marginTop: 5, marginBottom: 5 }}
        >
          Select Date
        </Button>

        {/* Button */}
        <Button
          onPress={pickImage}
          mode="outlined"
          style={{ marginTop: 5, marginBottom: 5 }}
        >
          Select Image
        </Button>

        {/* Button */}
        <Button
          onPress={saveEvent}
          mode="contained"
          loading={isLoading}
          style={{ marginTop: 5, marginBottom: 5 }}
        >
          Save Event
        </Button>

        {/* DateTimePickerModal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={hideDatePicker}
          onCancel={hideDatePicker}
        />

        {/* Snackbar */}
        <Snackbar
          visible={isSnackbarVisible}
          onDismiss={() => setSnackbarVisibility(true)}
        >
          All fields are required!
        </Snackbar>
      </View>
    </>
  );
}
