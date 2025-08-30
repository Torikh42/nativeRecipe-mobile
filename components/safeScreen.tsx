import { View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SafeScreen = ({ children, style }: any) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-gray-100"
      style={[
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default SafeScreen;
