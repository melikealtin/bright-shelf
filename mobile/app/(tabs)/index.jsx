import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuthStore } from "../../store/authStore.js";

export default function Home() {
  const { logout } = useAuthStore();
  return (
    <View>
      <Text>Home</Text>

      <TouchableOpacity onPress={logout}>
        <Text>logout</Text>
      </TouchableOpacity>
    </View>
  );
}
