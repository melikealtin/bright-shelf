import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/color";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>hello</Text>

      <Link href="/(auth)/signup">Signup</Link>
      <Link href="/(auth) ">Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: COLORS.textSecondary,
  },
});
