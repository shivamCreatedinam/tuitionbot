/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * https://www.google.com/maps/dir/Noida,+Uttar+Pradesh/Gurugram,+Haryana/@28.5563204,77.0362189,11z/data=!3m1!4b1!4m13!4m12!1m5!1m1!1s0x390ce5a43173357b:0x37ffce30c87cc03f!2m2!1d77.3910265!2d28.5355161!1m5!1m1!1s0x390d19d582e38859:0x2cf5fe8e5c64b1e!2m2!1d77.0266383!2d28.4594965?entry=ttu
 * @format
 */

import React from 'react';
import {
    View,
    Text,
    Pressable,
    Image,
    TextInput,
    TouchableOpacity,
    Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import ImagePicker from 'react-native-image-crop-picker';

const RegisterDriverTwoScreen = () => {

    const navigation = useNavigation();
    const routes = useRoute();
    const [initializing, setInitializing] = React.useState(true);
    const [secure, setSecure] = React.useState(true);
    const [user, setUser] = React.useState();
    const [VehicleNumber, setVehicleNumber] = React.useState('');
    const [AadharNumber, setAadharNumber] = React.useState('');
    const [Address, setAddress] = React.useState('');
    const [DrivingLicence, setDrivingLicence] = React.useState('');
    const [AadharFront, setAadharFront] = React.useState('');
    const [AadharBack, setAadharBack] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [uploadProfile, setuploadProfile] = React.useState(null);
    const [errors, setErrors] = React.useState('');
    const [location, setLocation] = React.useState({ latitude: 60.1098678, longitude: 24.7385084, });

    const handleLocationPermission = async () => {
        let permissionCheck = '';
        if (Platform.OS === 'ios') {
            permissionCheck = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

            if (permissionCheck === RESULTS.DENIED) {
                const permissionRequest = await request(
                    PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
                );
                permissionRequest === RESULTS.GRANTED ? console.warn('Location permission granted.') : console.warn('Location perrmission denied.');
            }
        }

        if (Platform.OS === 'android') {
            permissionCheck = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

            if (permissionCheck === RESULTS.DENIED) {
                const permissionRequest = await request(
                    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                );
                permissionRequest === RESULTS.GRANTED
                    ? console.warn('Location permission granted.')
                    : console.warn('Location perrmission denied.');
            }
        }
    };

    React.useEffect(() => {
        handleLocationPermission();
    }, []);

    React.useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
            },
            (error) => {
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    }, []);

    // Handle user state changes
    function onAuthStateChanged(user) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    React.useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    React.useEffect(() => {
        // AppState.addEventListener('change', _handleAppStateChange);
        return () => {
            // console.log('addEventListener');
        };
    }, [false]);

    const showSuccessToast = () => {
        Toast.show({
            type: 'success',
            text1: 'Register Success',
            text2: 'Welcome to ' + email + '! 👋'
        });
    }

    const showPasswordToast = () => Toast.show({ type: 'error', text1: 'Invalid Password!', });

    const showErrorToast = (msg) => {
        Toast.show({
            type: 'error',
            text1: 'Something went wrong!',
            text2: msg
        });
    }

    const validation = () => {
        console.log('validation1');
        let reg = new RegExp(/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/);
        console.log('validation2');
        const strongRegex = /(^[0-9]{4}[0-9]{4}[0-9]{4}$)|(^[0-9]{4}\s[0-9]{4}\s[0-9]{4}$)|(^[0-9]{4}-[0-9]{4}-[0-9]{4}$)/
        console.log('validation3');
        if (reg.test(VehicleNumber) === true) {
            console.log('validation4');
            if (strongRegex.test(AadharNumber)) {
                console.log('validation5');
                if (AadharBack !== null) {
                    if (AadharFront !== null) {
                        if (DrivingLicence !== null) {
                            moveToRegister();
                        } else {
                            showErrorToast('Upload Correct Driving Licence Image');
                        }
                    } else {
                        showErrorToast('Upload Correct Aadhar Card Front Image');
                    }
                } else {
                    showErrorToast('Upload Aadhar Card Back Image');
                }
            } else {
                console.log('validation6');
                showErrorToast('Enter Correct Aadhar Card Number');
            }
        } else {
            console.log('validation7');
            showErrorToast('Enter Correct Vehicle Number');
        }
    }

    const loggedIn = () => {
        auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {
                showSuccessToast();
            })
            .catch(error => {
                if (error.code === 'auth/user-not-found') {
                    setErrors('There is no user record corresponding to this identifier. The user may have been deleted.')
                }
            });
    }

    const registerUser = () => {
        auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
                showSuccessToast();
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    setErrors('That email address is already in use!');
                }
                if (error.code === 'auth/invalid-email') {
                    setErrors('That email address is invalid!');
                }
            });
    };

    const logOut = () => {
        auth()
            .signOut()
            .then(() => console.log('User signed out!'));
    }

    const uplodDrivingCard = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
        }).then(image => {
            console.log(image.path);
            setDrivingLicence(image.path)
        });
    }

    const uplodAadharFrontCard = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
        }).then(image => {
            console.log(image.path);
            setAadharFront(image.path)
        });
    }

    const uplodAadharBackCard = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
        }).then(image => {
            console.log(image.path);
            setAadharBack(image.path)
        });
    }

    const uplodProfilePhotoCard = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
        }).then(image => {
            console.log(image.path);
            setuploadProfile(image.path)
        });
    }

    const moveToRegister = () => {

        var formdata = new FormData();
        formdata.append('mobile', routes.params.mobile);
        formdata.append('email', routes.params.email);
        formdata.append('name', routes.params.name);
        formdata.append('vehicle_no', VehicleNumber);
        formdata.append('address', 'haryana');
        formdata.append('latitude', location.latitude);
        formdata.append('longitude', location.longitude);
        formdata.append('password', routes.params.password);
        formdata.append("aadhar_front", { uri: AadharFront, name: 'file_aadhar_photo.png', filename: 'file_aadhar_photo.png', type: 'image/png' });
        formdata.append("aadhar_back", { uri: AadharBack, name: 'file_aadhar_photo.png', filename: 'file_aadhar_photo.png', type: 'image/png' });
        formdata.append("drv_licence", { uri: DrivingLicence, name: 'file_aadhar_photo.png', filename: 'file_aadhar_photo.png', type: 'image/png' });

        var requestOptions = {
            method: 'POST',
            body: formdata,
            redirect: 'follow'
        };

        fetch('https://createdinam.in/Parihara/public/api/driver-signup', requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log('uploadProfile', result)
                if (result.status) {
                    Toast.show({
                        type: 'success',
                        text1: 'Congratulations!',
                        text2: result?.name + ' \n ' + result?.message,
                    });
                    saveAndReplace();
                } else {
                    Toast.show({
                        type: 'success',
                        text1: 'Something went wrong!',
                        text2: result?.message,
                    });
                }
            })
            .catch(error => console.log('error', error));
    }

    const storeData = async (value) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem('@autoDriverType', 'Driver');
            await AsyncStorage.setItem('@autoDriverGroup', jsonValue);
            navigation.navigate('UserBottomNavigation');
        } catch (e) {
            // saving error
        }
    };

    const saveAndReplace = async () => {
        navigation.replace('DriverLoginScreen');
    }

    return (
        <View style={{ padding: 20, flex: 1, marginTop: 20 }}>
            <View style={{ elevation: 5, flex: 1, padding: 20, backgroundColor: '#FFEEBB', borderRadius: 10, marginBottom: 40 }}>
                <TouchableOpacity style={{ padding: 20 }} onPress={() => uplodProfilePhotoCard()}>
                    {uploadProfile !== null ? <Image style={{ height: 120, width: 120, resizeMode: 'cover', alignSelf: 'center', alignItems: 'center', marginLeft: 75, marginBottom: 20, borderRadius: 150 }} source={{ uri: uploadProfile }} /> :
                        <Image style={{ height: 120, width: 120, resizeMode: 'cover', alignSelf: 'center', alignItems: 'center', marginLeft: 75, marginBottom: 20, borderRadius: 150 }} source={require('../../assets/profile_man.png')} />}
                    <View style={{ position: 'absolute', right: 0 }}>
                        <Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={require('../../assets/camera.png')} />
                    </View>
                </TouchableOpacity>
                <View style={{ marginTop: 25 }}>
                    <Text style={{ fontSize: 10, position: 'absolute', backgroundColor: '#FFEEBB', padding: 3, marginTop: -15, zIndex: 999, left: 2 }}>Vehicle No</Text>
                    <TextInput autoCapitalize='characters' placeholder='XX99XX9999' style={{ borderWidth: 1, borderColor: '#b4b4b4', borderRadius: 4, padding: 10 }} onChangeText={(e) => setVehicleNumber(e)} />
                </View>
                <View style={{ marginTop: 25 }}>
                    <Text style={{ fontSize: 10, position: 'absolute', backgroundColor: '#FFEEBB', padding: 3, marginTop: -15, zIndex: 999, left: 2 }}>Aadhar Number</Text>
                    <TextInput inputMode='numeric' placeholder='####-####-####' style={{ borderWidth: 1, borderColor: '#b4b4b4', borderRadius: 4, padding: 10 }} onChangeText={(e) => setAadharNumber(e)} />
                </View>
                <View style={{ marginTop: 25 }}>
                    <Text style={{ fontSize: 10, position: 'absolute', backgroundColor: '#FFEEBB', padding: 3, marginTop: -15, zIndex: 999, left: 2 }}>Address</Text>
                    <TextInput autoCapitalize="none" autoCorrect={false} placeholder='Enter driver address' style={{ borderWidth: 1, borderColor: '#b4b4b4', borderRadius: 4, padding: 10 }} onChangeText={(e) => setAddress(e)} />
                </View>
                <View style={{ marginTop: 25 }}>
                    <Text style={{ fontSize: 10, position: 'absolute', backgroundColor: '#FFEEBB', padding: 3, marginTop: -15, zIndex: 999, left: 2 }}>Driving Licence</Text>
                    <TextInput placeholder='Upload Driving Licence' defaultValue={DrivingLicence} style={{ borderWidth: 1, borderColor: '#b4b4b4', borderRadius: 4, padding: 10, paddingRight: 40 }} editable={false} />
                    <Pressable onPress={() => uplodDrivingCard()} style={{ position: 'absolute', right: 15, top: 15, backgroundColor: '#FFEEBB' }}>
                        <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('../../assets/camera.png')} />
                    </Pressable>
                </View>
                <View style={{ marginTop: 25 }}>
                    <Text style={{ fontSize: 10, position: 'absolute', backgroundColor: '#FFEEBB', padding: 3, marginTop: -15, zIndex: 999, left: 2 }}>Aadhar Front</Text>
                    <TextInput placeholder='Upload Driving Licence' defaultValue={AadharFront} style={{ borderWidth: 1, borderColor: '#b4b4b4', borderRadius: 4, padding: 10, paddingRight: 40 }} editable={false} />
                    <Pressable onPress={() => uplodAadharFrontCard()} style={{ position: 'absolute', right: 15, top: 15 }}>
                        <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('../../assets/camera.png')} />
                    </Pressable>
                </View>
                <View style={{ marginTop: 25 }}>
                    <Text style={{ fontSize: 10, position: 'absolute', backgroundColor: '#FFEEBB', padding: 3, marginTop: -15, zIndex: 999, left: 2 }}>Aadhar Back</Text>
                    <TextInput placeholder='Upload Driving Licence' defaultValue={AadharBack} style={{ borderWidth: 1, borderColor: '#b4b4b4', borderRadius: 4, padding: 10, paddingRight: 40 }} editable={false} />
                    <Pressable onPress={() => uplodAadharBackCard()} style={{ position: 'absolute', right: 15, top: 15 }}>
                        <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('../../assets/camera.png')} />
                    </Pressable>
                </View>
                <TouchableOpacity
                    style={{
                        width: '100%',
                        marginTop: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 14,
                        backgroundColor: 'black',
                        borderRadius: 5,
                        elevation: 6,
                    }}
                    onPress={() => validation()}>
                    <Text style={{
                        color: 'white',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                    }}>Register Driver</Text>
                </TouchableOpacity>
                {/* <View style={{ marginTop: 20, alignSelf: 'flex-end', marginRight: 10 }}>
                    <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => moveToRegister()}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#b4b4b4' }}>Sign In</Text>
                    </TouchableOpacity>
                </View> */}
                <View style={{ marginTop: 20 }}>
                    <Text style={{ color: '#FE0000', fontWeight: 'bold', fontSize: 10 }}>{errors}</Text>
                </View>
                {/* <Pressable onPress={() => logOut()}>
                    <Text>Logout</Text>
                </Pressable>
                <View>
                    <Text>Welcome {user?.email}</Text>
                    <Text>Welcome {JSON.stringify(user?.uid)}</Text>
                </View> */}
            </View>
        </View>
    );

};


export default RegisterDriverTwoScreen;