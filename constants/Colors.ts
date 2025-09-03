/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#c67d00"; // Primary Orange
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#4a4a40", // Dark Brown
    background: "#fffbf0", // Warm Ivory
    tint: tintColorLight,
    icon: "#4a4a40",
    tabIconDefault: "#687076", // Keep this a neutral gray
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
