import React from 'react';
import {MapView} from 'expo';
import {Button} from 'react-native-elements';
import {
  StyleSheet,
  Text,
  Alert,
  View,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {Marker} from 'react-native-maps';
import {Constants, Location, Permissions} from 'expo';
import isEqual from 'lodash/isEqual';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Map',
  };

  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = {
      myPosition: null,
    };
  }
  componentDidMount() {
    this.mounted = true;
    // If you supply a coordinate prop, we won't try to track location automatically
    if (this.props.coordinate) return;

    if (Platform.OS === 'android') {
      PermissionsAndroid.requestPermission(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(granted => {
        if (granted && this.mounted) this.watchLocation();
      });
    } else {
      if (this.askIOS()) {
        this.watchLocation();
      }
    }
  }

  askIOS = async () => {
    let {status} = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
      return false;
    }
    return true;
  };

  watchLocation() {
    // eslint-disable-next-line no-undef
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const myLastPosition = this.state.myPosition;
        const myPosition = position.coords;
        if (!isEqual(myPosition, myLastPosition)) {
          this.setState({myPosition});
        }
      },
      error => console.log(error),
      this.props.geolocationOptions,
    );
  }
  componentWillUnmount() {
    this.mounted = false;
    // eslint-disable-next-line no-undef
    if (this.watchID) navigator.geolocation.clearWatch(this.watchID);
  }
  render() {
    let {heading, coordinate} = this.props;
    if (!coordinate) {
      const {myPosition} = this.state;
      if (!myPosition) return null;
      coordinate = {
        latitude: myPosition.latitude,
        longitude: myPosition.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      heading = myPosition.heading;
    }

    console.log(coordinate);

    const rotate =
      typeof heading === 'number' && heading >= 0 ? `${heading}deg` : null;

    return (
      <View style={{flex: 1}}>
        <MapView
          style={{flex: 1}}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          region={{coordinate}}
          showBuildings={true}
          showUserLocation={true}
          followUserLocation={true}
          showCompass={true}
        />
        <Button
          raised
          style={{
            bottom: 10,
            zIndex: 3,
          }}
          backgroundColor="gray"
          icon={{name: 'location-on'}}
          title="Locate me"
          onPress={this._handlePress}
        />
      </View>
    );
  }

  _handlePress(e) {
    Alert.alert('You tapped the button!');
    console.log(e.nativeEvent, e);
  }
}
