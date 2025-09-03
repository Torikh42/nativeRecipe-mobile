import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { Recipe } from "@/types";
import { Link } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function DashboardScreen() {
  const { token, isLoading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Bungkus fetchMyRecipes dengan useCallback
  const fetchMyRecipes = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      setError("Anda harus login untuk melihat resep Anda.");
      setIsRefreshing(false); // Pastikan state refresh juga direset
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/recipes/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengambil resep Anda.");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]); // Dependensinya adalah token

  // 2. Perbarui dependency array useEffect
  useEffect(() => {
    if (authLoading) return;
    setIsLoading(true);
    fetchMyRecipes();
  }, [authLoading, fetchMyRecipes]);

  // 3. Perbarui dependency array useCallback onRefresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchMyRecipes();
  }, [fetchMyRecipes]);

  if (isLoading || authLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FFA500" />
        <Text className="mt-2 text-base text-gray-500">
          Memuat resep Anda...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Text className="text-3xl font-bold mb-5 text-gray-800 text-center">
        Resep Saya
      </Text>
      {recipes.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            Anda belum membuat resep apa pun.
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            Mulai buat resep pertama Anda!
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link href={`/recipe/${item.id}`} asChild>
              <TouchableOpacity className="flex-row bg-white rounded-xl mb-4 shadow-md overflow-hidden">
                {item.image_url && (
                  <Image
                    source={{ uri: item.image_url }}
                    className="w-24 h-full"
                  />
                )}
                <View className="flex-1 p-4 justify-center">
                  <Text className="text-lg font-bold text-gray-800">
                    {item.title}
                  </Text>
                  <Text
                    className="text-sm text-gray-500 mt-1"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#FFA500"]}
              tintColor={"#FFA500"}
            />
          }
        />
      )}
    </View>
  );
}
