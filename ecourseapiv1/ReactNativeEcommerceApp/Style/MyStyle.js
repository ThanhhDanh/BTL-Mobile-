import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 60,
        // alignItems: 'center',
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
    margin5: {
        margin: 10,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 50,
    }
});