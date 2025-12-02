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
import { LinearGradient } from "expo-linear-gradient";

// --- 設定 ---
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

// カードの最大傾き角度（度）
// 15度くらいが上品でおすすめです
const MAX_ANGLE = 10;

const PARALLAX_OFFSET = 0; // 中身をどれくらい浮き上がらせるか（ピクセル）、値が大きいほど手前に浮いているように見えます

export default function App() {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  // ジェスチャー設定
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // 感度調整: 指の移動量を適度に抑えて回転角度に変換
      rotateX.value = event.translationY * -0.3;
      rotateY.value = event.translationX * 0.3;
    })
    .onEnd(() => {
      // 指を離したらバネの動きで元に戻る
      rotateX.value = withSpring(0);
      rotateY.value = withSpring(0);
    });

  // 1. カード全体の回転アニメーション
  const cardAnimatedStyle = useAnimatedStyle(() => {
    // 傾きを MAX_ANGLE で制限（CLAMP）
    const rX = interpolate(
      rotateX.value,
      [-MAX_ANGLE, MAX_ANGLE],
      [-MAX_ANGLE, MAX_ANGLE],
      Extrapolation.CLAMP
    );
    const rY = interpolate(
      rotateY.value,
      [-MAX_ANGLE, MAX_ANGLE],
      [-MAX_ANGLE, MAX_ANGLE],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 1000 }, // 3D効果の強さ（小さいほどパースがきつい）
        { rotateX: `${rX}deg` },
        { rotateY: `${rY}deg` },
      ],
    };
  });

  // 2. 中身のパララックス（視差）アニメーション
  const contentAnimatedStyle = useAnimatedStyle(() => {
    // 傾きと「逆方向」に移動させることで、手前に浮いているように見せる
    const translateX = interpolate(
      rotateY.value,
      [-MAX_ANGLE, MAX_ANGLE],
      [PARALLAX_OFFSET, -PARALLAX_OFFSET], // ★反転させるのがポイント
      Extrapolation.CLAMP
    );
    
    const translateY = interpolate(
      rotateX.value,
      [-MAX_ANGLE, MAX_ANGLE],
      [PARALLAX_OFFSET, -PARALLAX_OFFSET], // ★反転
      Extrapolation.CLAMP
    );

    // ほんの少し逆回転させて、要素を正面に向けようとする補正（リッチな質感用）
    const reverseRotateX = interpolate(
      rotateX.value,
      [-MAX_ANGLE, MAX_ANGLE],
      [MAX_ANGLE * 0.1, -MAX_ANGLE * 0.1], 
      Extrapolation.CLAMP
    );
    const reverseRotateY = interpolate(
      rotateY.value,
      [-MAX_ANGLE, MAX_ANGLE],
      [MAX_ANGLE * 0.1, -MAX_ANGLE * 0.1], 
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { rotateX: `${reverseRotateX}deg` },
        { rotateY: `${reverseRotateY}deg` },
      ],
    };
  });

  // 3. 光の反射（Sheen）アニメーション
  const sheenAnimatedStyle = useAnimatedStyle(() => {
    // 傾きに合わせて光の帯を大きくスライドさせる
    // カードを右に傾ける(正) -> 光は左へ逃げる(負)
    const translateX = interpolate(
      rotateY.value,
      [-MAX_ANGLE, MAX_ANGLE],
      [120, -120],
      Extrapolation.CLAMP
    );

    // 傾けたときだけ透明度を上げてキラッとさせる
    const opacity = interpolate(
      Math.abs(rotateY.value),
      [0, MAX_ANGLE],
      [0.2, 0.5] // 中央では薄く、傾けると少し明るく
    );

    return {
      opacity,
      transform: [
        { translateX }, 
        { scale: 1.3 } // カードより少し大きくして端が見えないように
      ],
    };
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 背景 */}
      <View style={styles.backgroundLayer} />

      <View style={styles.contentContainer}>
        <GestureDetector gesture={gesture}>
          {/* カードの外枠 */}
          <Animated.View style={[styles.card, cardAnimatedStyle]}>
            
            {/* 中身（テキストや円） */}
            <Animated.View style={[styles.cardContent, contentAnimatedStyle]}>
              <View style={styles.circle} />
              <Text style={styles.title}>3D Card</Text>
              <Text style={styles.subtitle}>Drag me!</Text>
            </Animated.View>

            {/* 光の反射レイヤー（一番手前） */}
            {/* pointerEvents="none" でタッチ操作を透過させる */}
            <View style={styles.sheenContainer} pointerEvents="none">
              <Animated.View style={[styles.sheenInner, sheenAnimatedStyle]}>
                <LinearGradient
                  // 上品で薄い光のグラデーション
                  colors={[
                    'transparent', 
                    'rgba(255, 255, 255, 0.05)', 
                    'rgba(255, 255, 255, 0.25)', // ピークの明るさ
                    'rgba(255, 255, 255, 0.05)', 
                    'transparent'
                  ]}
                  // 斜めに入る光
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>

          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#111",
    zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    // 光がはみ出さないようにマスクする
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  // 光沢を包括するコンテナ
  sheenContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    borderRadius: 20,
    overflow: "hidden",
  },
  // 実際に動く光の帯（カードより大きく作る）
  sheenInner: {
    width: "180%",
    height: "180%",
    position: "absolute",
    top: "-40%",
    left: "-40%",
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