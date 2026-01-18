# NativeRecipe Mobile App 📱

A premium, cross-platform mobile application for discovering and managing recipes, built with Expo and React Native.

## ✨ Key Features

-   **Magic Chef AI 🧞‍♂️**: Generate unique recipes just by inputting ingredients you have at home. Powered by Gemini/DeepSeek models.
-   **Premium Design**: A modern, vibrant "Coral & Cream" aesthetic with smooth animations and clean typography.
-   **Recipe Management**: Browse, view, and add your favorite recipes.
-   **Authentication**: Secure login and signup.

## 🛠 Tech Stack

-   **Framework**: Expo (React Native)
-   **Routing**: Expo Router
-   **Styling**: NativeWind (TailwindCSS)
-   **Icons**: SF Symbols (via IconSymbol)

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    Create a `.env` file (copy from `.env.example`):
    ```env
    EXPO_PUBLIC_SUPABASE_URL=...
    EXPO_PUBLIC_SUPABASE_ANON_KEY=...
    EXPO_PUBLIC_API_URL=http://your-local-ip:3001  # Point to your backend
    ```
3.  **Run the App**:
    ```bash
    npx expo start --clear
    ```
4.  **Test on Device**:
    Scan the QR code with Expo Go (Android/iOS).

## 📸 AI Features
Navigate to the "Magic Chef" tab to experience the AI recipe generation.
