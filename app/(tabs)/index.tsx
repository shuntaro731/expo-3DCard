import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

export default function App() {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      rotateX.value = event.translationY * -0.2;
      rotateY.value = event.translationX * 0.2;
    })
    .onEnd(() => {
      rotateX.value = withSpring(0);
      rotateY.value = withSpring(0);
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rX = interpolate(
      rotateX.value,
      [-30, 30],
      [-30, 30],
      Extrapolation.CLAMP
    );
    const rY = interpolate(
      rotateY.value,
      [-30, 30],
      [-30, 30],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rX}deg` },
        { rotateY: `${rY}deg` },
      ],
    };
  });

  const parallaxStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      rotateY.value,
      [-30, 30],
      [-20, 20],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      rotateX.value,
      [-30, 30],
      [-20, 20],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX }, { translateY }],
    };
  });

  // ★変更点: コンテナの構造を変えました
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 1. 背景レイヤー：絶対配置で一番後ろに置く */}
      <View style={styles.backgroundLayer} />

      {/* 2. 操作エリア：背景色は透明にする */}
      <View style={styles.contentContainer}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.card, cardAnimatedStyle]}>
            <Animated.View style={[styles.cardContent, parallaxStyle]}>
              <View style={styles.circle} />
              <Text style={styles.title}>3D Card</Text>
              <Text style={styles.subtitle}>Drag me!</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // ★変更点: 背景専用のスタイルを追加
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#111",
    zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    overflow: "visible",
    zIndex: 1,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#222",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    overflow: "hidden",
    zIndex: 2,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "cyan",
    marginBottom: 20,
    opacity: 0.8,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 18,
    marginTop: 10,
  },
});
