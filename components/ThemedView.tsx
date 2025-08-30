import { View, type ViewProps } from "react-native";

export function ThemedView({ style, ...rest }: ViewProps) {
  return <View style={style} {...rest} />;
}
