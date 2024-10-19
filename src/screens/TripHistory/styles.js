import { StyleSheet } from "react-native";
import Colors from "../../../common/Colour";

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    mapContainer: {
        height: "50%"
    },
    bottomContainer: {
        height: "50%"
    },
    floatTopButton: {
        position: "absolute",
        top: 50,
        left: 20,
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: Colors.lightGrey,
        zIndex: 4,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
    },
    shadowOffset: {
        width: 0,
        height: 3,
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    }
});

export default styles;
