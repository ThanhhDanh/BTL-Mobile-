import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 60,
        alignItems: 'center',
    },
    labels: {
        fontSize:30,
        fontWeight: 'bold',
        color: 'red',
        alignSelf: 'center',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    justifyConCenter: {
        justifyContent: 'center',
    },
    margin_auto: {
        margin: 'auto',
    },
    margin10: {
        margin: 10,
    },
    img: {
        width: 80,
        height: 80,
        borderRadius: 20,
    }
});