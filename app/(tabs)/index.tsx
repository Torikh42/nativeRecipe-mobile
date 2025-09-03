import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { Recipe } from "@/types";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

import { Colors } from "@/constants/Colors";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/recipes`;

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (e) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred.";
      Alert.alert("Logout Error", message);
    }
  };

  const fetchRecipes = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Gagal terhubung ke server");
      }
      const data = (await response.json()) as Recipe[];
      setRecipes(data);
      setError(null); // Clear previous errors
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRecipes();
  }, [fetchRecipes]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRecipes();
  }, [fetchRecipes]);

  const renderItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity onPress={() => router.push({ pathname: "/recipe/[id]", params: { id: item.id.toString() } })}>
      <View className="bg-white overflow-hidden p-5 my-2 mx-4 rounded-xl shadow-lg border border-gray-200">
        {item.image_url && <Image source={{ uri: item.image_url }} className="w-full h-48 rounded-lg mb-4" />}
        <Text className="text-xl font-bold text-gray-800">{item.title}</Text>
        <Text className="text-base text-gray-600 mt-2">{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-orange-50">
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text className="mt-2 text-base text-orange-600">Memuat Resep...</Text>
      </View>
    );
  }

  if (error && recipes.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-orange-50">
        <Text className="text-red-500 text-base mb-2 text-center">Error: {error}</Text>
        <Text className="text-sm text-gray-600 text-center">Pastikan backend berjalan dan IP address sudah benar.</Text>
        <TouchableOpacity onPress={onRefresh} className="mt-4 bg-blue-500 py-2 px-4 rounded-lg">
          <Text className="text-white font-bold">Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-gray-200 shadow-sm">
        <Text className="text-2xl font-bold text-orange-600">Buku Resep Saya 🧑‍🍳</Text>
        <TouchableOpacity onPress={handleLogout} className="bg-orange-500 py-2 px-3 rounded-lg">
          <Text className="text-white font-bold">Logout</Text>
        </TouchableOpacity>
      </View>
      {recipes.length > 0 ? (
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.light.tint]} />}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-base text-gray-500">Belum ada resep yang ditambahkan.</Text>
          <TouchableOpacity onPress={onRefresh} className="mt-4 bg-blue-500 py-2 px-4 rounded-lg">
            <Text className="text-white font-bold">Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
