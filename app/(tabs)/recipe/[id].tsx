import { useLocalSearchParams, Stack } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Recipe, Ingredient } from "@/types";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/recipes`;

// Define the shape of the recipe with ingredients, similar to the web app
type RecipeDetail = Recipe & {
  ingredients: Ingredient[];
};

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipeDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error("Gagal memuat detail resep");
      }
      // Cast to the correct RecipeDetail type
      const data = (await response.json()) as RecipeDetail;
      setRecipe(data);
      setError(null);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecipeDetails();
  }, [fetchRecipeDetails]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRecipeDetails();
  }, [fetchRecipeDetails]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-pink-50">
        <ActivityIndicator size="large" color="#FF5733" />
        <Text className="mt-2 text-base text-pink-600">Memuat Detail...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-pink-50">
        <Text className="text-red-500 text-lg mb-4 text-center">
          {error || "Resep tidak ditemukan."}
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="mt-4 bg-blue-500 py-2 px-4 rounded-lg"
        >
          <Text className="text-white font-bold">Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: recipe.title, headerBackTitle: "Kembali" }}
      />
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {recipe.image_url && (
          <Image source={{ uri: recipe.image_url }} className="w-full h-60" />
        )}
        <View className="p-5">
          <Text className="text-3xl font-extrabold text-gray-900 mb-3">
            {recipe.title}
          </Text>
          <Text className="text-base text-gray-600 mb-6">
            {recipe.description}
          </Text>

          <View className="border-t border-gray-200 pt-4">
            <Text className="text-2xl font-bold text-gray-800 mb-3">
              Bahan-bahan
            </Text>
            {recipe.ingredients.map((ingredient) => (
              <Text
                key={ingredient.id}
                className="text-base text-gray-700 leading-relaxed"
              >
                • {ingredient.name}: {ingredient.quantity}
              </Text>
            ))}
          </View>

          <View className="border-t border-gray-200 mt-6 pt-4">
            <Text className="text-2xl font-bold text-gray-800 mb-3">
              Instruksi
            </Text>
            <Text className="text-base text-gray-700 leading-relaxed">
              {recipe.instructions}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
