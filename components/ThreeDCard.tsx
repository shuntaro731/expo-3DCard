import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// --- 設定 ---
const DEFAULT_MAX_ANGLE = 12;
const DEFAULT_PARALLAX_OFFSET = 2;

// 指を離した時の物理挙動（少し重みのあるバネ）
const SPRING_CONFIG: WithSpringConfig = {
  mass: 1,
  stiffness: 120,
  damping: 18,
};

// Propsの型定義
interface ThreeDCardProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  maxAngle?: number;       // 傾きの最大角度（自由に変えられるように）
  parallaxOffset?: number; // 浮き具合（自由に変えられるように）
}

export const ThreeDCard: React.FC<ThreeDCardProps> = ({
  children,
  width = 300,
  height = 450,
  style,
  maxAngle = DEFAULT_MAX_ANGLE,
  parallaxOffset = DEFAULT_PARALLAX_OFFSET,
}) => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // ★ダイレクト操作: 指の動きを直接角度に変換（違和感をなくすため慣性なし）
      rotateX.value = event.translationY * -0.4;
      rotateY.value = event.translationX * 0.4;
    })
    .onEnd(() => {
      // 指を離した時だけバネで戻る
      rotateX.value = withSpring(0, SPRING_CONFIG);
      rotateY.value = withSpring(0, SPRING_CONFIG);
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rX = interpolate(rotateX.value, [-maxAngle, maxAngle], [-maxAngle, maxAngle], Extrapolation.CLAMP);
    const rY = interpolate(rotateY.value, [-maxAngle, maxAngle], [-maxAngle, maxAngle], Extrapolation.CLAMP);

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rX}deg` },
        { rotateY: `${rY}deg` },
      ],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(rotateY.value, [-maxAngle, maxAngle], [parallaxOffset, -parallaxOffset], Extrapolation.CLAMP);
    const translateY = interpolate(rotateX.value, [-maxAngle, maxAngle], [parallaxOffset, -parallaxOffset], Extrapolation.CLAMP);
    
    // 逆回転補正
    const reverseRotateX = interpolate(rotateX.value, [-maxAngle, maxAngle], [maxAngle * 0.1, -maxAngle * 0.1], Extrapolation.CLAMP);
    const reverseRotateY = interpolate(rotateY.value, [-maxAngle, maxAngle], [maxAngle * 0.1, -maxAngle * 0.1], Extrapolation.CLAMP);

    return {
      transform: [
        { translateX },
        { translateY },
        { rotateX: `${reverseRotateX}deg` },
        { rotateY: `${reverseRotateY}deg` },
      ],
    };
  });

  const sheenAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(rotateY.value, [-maxAngle, maxAngle], [120, -120], Extrapolation.CLAMP);
    const opacity = interpolate(Math.abs(rotateY.value), [0, maxAngle], [0.2, 0.5]);

    return {
      opacity,
      transform: [{ translateX }, { scale: 1.3 }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, { width, height }, style, cardAnimatedStyle]}>
        {/* コンテンツ */}
        <Animated.View style={[styles.cardContent, contentAnimatedStyle]}>
          {children}
        </Animated.View>

        {/* 光沢レイヤー */}
        <View style={styles.sheenContainer} pointerEvents="none">
          <Animated.View style={[styles.sheenInner, sheenAnimatedStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.05)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.5 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
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
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  sheenContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    borderRadius: 20,
    overflow: "hidden",
  },
  sheenInner: {
    width: "180%",
    height: "180%",
    position: "absolute",
    top: "-40%",
    left: "-40%",
  },
});