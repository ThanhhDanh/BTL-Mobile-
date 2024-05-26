import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
export default StyleSheet.create({
    container: {
        flex: 1,
        // marginTop: 60,//rgba(0,0,0,.06)
    },
    app: {
        marginTop: 30,
    },
    letterColor: {
        color: '#000',
        fontSize: 14,
    },
    letterFont: {
        fontSize: 20
    },
    setForm: {
        height: '100%',
        width: '100%',
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
        margin: 5,
    },
    img: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    imgComment: {
        width: 40,
        height: 40,
        borderRadius: 50,
        margin: 10
    },
    input: {
        width:'70%',
        height: 30,
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 50,
        justifyContent: 'space-between',
    },
    textInput: {
        height: '100%',
        width: '70%',
        borderBottomColor: 'darkgrey',
        borderBottomWidth: 1,
    },
    btns: {
        width: '100%',
        height: '20%',
        marginTop: 0.15 * windowHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn: {
        width: '60%',
        height: '40%',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    buttonText: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
    },
    shadowMenuUser: {
        elevation: 5, // Thêm hiệu ứng shadow
        backgroundColor: '#fff', // Màu nền của phần thông tin
        padding: 20, 
        marginTop: 10,
        marginHorizontal: 20, // Thêm margin để nó không nằm sát mép
        borderRadius: 10, // Bo tròn các góc
    },
    searchResults: {
        maxHeight: 200, // Đặt chiều cao tối đa cho kết quả tìm kiếm      
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        width: windowWidth - 60,
        zIndex: 1
    },
    navBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '60%',
        height: windowHeight,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1,
        padding: 20,
    },
    cateItem: {
        borderWidth: 1,
        backgroundColor: 'rgba(52, 52, 52, 0.2)', 
        marginBottom: 20, height: 50, 
        borderRadius: 20, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
    
    },
    hotText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 5,
        borderBottomWidth: 5,
        borderRightWidth: 10,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: '#f0799a', // Màu của tam giác
        zIndex: -1
      },
      button: {
        backgroundColor: "orange",
        color: "darkblue",
        padding: 10,
    }
});