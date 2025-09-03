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

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          (data as { error?: string }).error || "Pendaftaran gagal."
        );
      }

      Alert.alert(
        "Pendaftaran Berhasil",
        "Silakan cek email Anda untuk verifikasi."
      );
      router.replace("../login");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Pendaftaran Gagal", error.message);
      } else {
        Alert.alert(
          "Pendaftaran Gagal",
          "Terjadi kesalahan yang tidak diketahui."
        );
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
          <Text className="text-3xl font-bold mb-6 text-center text-orange-600">
            Daftar Akun Baru
          </Text>
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 text-gray-800 focus:border-orange-500"
            placeholder="Nama Lengkap"
            placeholderTextColor="#9CA3AF"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
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
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold">Daftar</Text>
            )}
          </TouchableOpacity>
          <Link
            href="../login"
            className="mt-5 text-orange-600 text-base text-center"
          >
            Sudah punya akun? Login
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
