# NativeRecipe Mobile App 📱

A premium, cross-platform mobile application for discovering and managing recipes, built with Expo and React Native.

## ✨ Key Features

-   **🍳 Magic Chef AI**: Generate unique recipes just by inputting ingredients you have at home, powered by Google Gemini.
-   **💎 Premium Design**: A modern, vibrant "Coral & Cream" aesthetic with smooth animations and clean typography using NativeWind.
-   **📖 Recipe Management**: Browse, view, and add your favorite recipes on the go.
-   **🖼️ Image Uploads**: Direct integration for capturing and uploading recipe photos.
-   **🔒 Secure Auth**: Seamless login and signup experience.

## 🛠 Tech Stack

-   **Framework**: [Expo](https://expo.dev/) (React Native)
-   **Routing**: Expo Router (File-based)
-   **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
-   **Icons**: SF Symbols / Lucide (via IconSymbol)
-   **Storage**: Cloudflare R2 via Backend API
-   **Database**: Supabase

## 🚀 Getting Started

### Prerequisites

-   Node.js 20+
-   Expo Go app installed on your physical device

### Installation

1.  Navigate to the `mobile2` directory:
    ```bash
    cd mobile2
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables in `.env`:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    EXPO_PUBLIC_API_URL=http://your-local-ip:3001
    ```
    *Note: Use your machine's local IP address instead of `localhost` for testing on physical devices.*

### Running the App

```bash
npx expo start
```
Scan the QR code with your camera (iOS) or Expo Go app (Android).

## 🤖 AI Chef
Navigate to the **AI Chef** tab (✨ icon) to experience the Gemini-powered cooking assistant.