import { useAuth } from "@/context/AuthContext";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.message || "Email atau password salah.");
      }
      signIn(data.token);
      router.replace("/");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Login Gagal", error.message);
      } else {
        Alert.alert("Login Gagal", "Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-8">
        <View className="mb-12">
          <Text className="text-4xl font-bold text-secondary mb-2">
            Selamat Datang,
          </Text>
          <Text className="text-lg text-gray-500">
            Masuk untuk melanjutkan aktivitas memasakmu.
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 font-medium mb-1 ml-1">Email</Text>
            <TextInput
              className="w-full p-4 bg-surface rounded-2xl border border-gray-100 text-secondary shadow-sm focus:border-primary focus:border-2"
              placeholder="hello@example.com"
              placeholderTextColor="#A0AEC0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-600 font-medium mb-1 ml-1">Password</Text>
            <TextInput
              className="w-full p-4 bg-surface rounded-2xl border border-gray-100 text-secondary shadow-sm focus:border-primary focus:border-2"
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="bg-primary p-4 rounded-2xl items-center mt-6 shadow-md shadow-orange-200"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold">Masuk</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 text-base">Belum punya akun? </Text>
          <Link href="../signup" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-bold text-base">Daftar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
