import { useEffect, useState, useRef } from "react"
import { Dimensions, Image, ScrollView, View, Animated } from "react-native"

const {width: screenWidth} = Dimensions.get('window');


const PictureList = () => {
    const [imageList, setImageList] = useState([]);
    const [currentImg, setCurrentImg] = useState(0);
    const stepCarousel = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const intervalRef = useRef(null);

    useEffect(() => {
        const dataImg = [
            { image: require('../Image/voucher1.jpeg'), type: 'png', camera: 'camera' },
            { image: require('../Image/voucher2.jpg'), type: 'png', camera: 'camera' },
            { image: require('../Image/voucher3.jpg'), type: 'png', camera: 'camera' },
            { image: require('../Image/voucher4.jpg'), type: 'png', camera: 'camera' },
            { image: require('../Image/voucher5.jpg'), type: 'png', camera: 'camera' },
            { image: require('../Image/voucher6.jpg'), type: 'png', camera: 'camera' },
        ];

        setImageList(dataImg);
    }, []);

    useEffect(() => {
        if (imageList.length > 0) {
            let i = 0;
            intervalRef.current = setInterval(() => {
                stepCarousel.current.scrollTo({ x: i * screenWidth, y: 0, animated: true });
                i += 1;
                if (i === imageList.length) {
                    i = 0;
                }
            }, 5000); // 5000ms tương ứng với 5 giây

            return () => clearInterval(intervalRef.current);
        }
    }, [imageList]);

    const handleScroll = (e) => {
        if (!e) {
            return;
        }
        const { nativeEvent } = e;
        if (nativeEvent && nativeEvent.contentOffset) {
            const currentOffset = nativeEvent.contentOffset.x;
            let imgIndex = 0;
            if (nativeEvent.contentOffset.x > 0) {
                imgIndex = Math.floor((nativeEvent.contentOffset.x + screenWidth / 2) / screenWidth);
            }
            setCurrentImg(imgIndex);
        }
    };

    return (
        <View style={{ flex: 1, alignItems: 'center' }}>
            <Animated.ScrollView
                horizontal
                contentContainerStyle={{ width: screenWidth * imageList.length, height: 180 }}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false, listener: handleScroll }
                )}
                ref={stepCarousel}
                pagingEnabled
            >
                {imageList.map((item, index) =>
                    <View style={{ width: screenWidth, height: 180}} key={index.toString()}>
                        <Image
                            style={{ width: screenWidth - 10, height: '100%', marginLeft: 5, marginRight: 5, borderRadius: 20}}
                            source={item.image}
                            resizeMode="stretch"
                        />
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    );
};

export default PictureList;