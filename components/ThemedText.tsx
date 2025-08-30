import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({ type = "default", ...rest }: ThemedTextProps) {
  const className = {
    default: "text-base",
    title: "text-4xl font-bold",
    defaultSemiBold: "text-base font-semibold",
    subtitle: "text-xl font-bold",
    link: "text-base text-blue-500 underline",
  }[type];

  return <Text className={className} {...rest} />;
}
