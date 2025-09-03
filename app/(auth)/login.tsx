import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { supabase } from "../../lib/supabaseClient";



export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      type LoginResponse = { error?: string; session?: any };
      const loginData = data as LoginResponse;

      if (!response.ok) {
        throw new Error(loginData.error || "Login gagal.");
      }

      if (loginData.session) {
        const { error: setSessionError } = await supabase.auth.setSession(
          loginData.session
        );
        if (setSessionError) {
          throw new Error(setSessionError.message);
        }
      }

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
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center items-center p-5 bg-orange-50">
        <View className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
          <Text className="text-3xl font-bold mb-6 text-center text-orange-600">Masuk Akun</Text>
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 text-gray-800 focus:border-orange-500"
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 text-gray-800 focus:border-orange-500"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            className="bg-orange-500 p-4 rounded-lg items-center mt-2.5"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold">Login</Text>
            )}
          </TouchableOpacity>
          <Link href="../signup" className="mt-5 text-orange-600 text-base text-center">
            Belum punya akun? Daftar
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}