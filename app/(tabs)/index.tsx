import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThreeDCard } from "../../components/ThreeDCard";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* コンポーネントを使用 */}
        <ThreeDCard width={CARD_WIDTH} height={CARD_HEIGHT}>
          {/* カードの中身を自由に記述 */}
          <View style={styles.circle} />
          <Text style={styles.title}>3D Card</Text>
          <Text style={styles.subtitle}>Drag me!</Text>
        </ThreeDCard>

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111", // 背景色
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
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
  },
  subtitle: {
    color: "#aaa",
    fontSize: 18,
    marginTop: 10,
  },
});