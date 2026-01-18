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

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, fullName }),
        }
      );

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
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-8">
        <View className="mb-10">
          <Text className="text-4xl font-bold text-secondary mb-2">
            Buat Akun,
          </Text>
          <Text className="text-lg text-gray-500">
            Daftar untuk mulai berbagi resep spesialmu.
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 font-medium mb-1 ml-1">Nama Lengkap</Text>
            <TextInput
              className="w-full p-4 bg-surface rounded-2xl border border-gray-100 text-secondary shadow-sm focus:border-primary focus:border-2"
              placeholder="Juru Masak Handal"
              placeholderTextColor="#A0AEC0"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

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
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold">Daftar Sekarang</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 text-base">Sudah punya akun? </Text>
          <Link href="../login" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-bold text-base">Masuk</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
