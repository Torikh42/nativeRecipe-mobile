import { useLocalSearchParams, Stack, useRouter } from "expo-router";
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
  SafeAreaView,
} from "react-native";
import { Recipe, Ingredient } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons"; // Import icons

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
  const { user, token } = useAuth();
  const router = useRouter();

  const fetchRecipeDetails = useCallback(async () => {
    if (!id) return;
    // Don't show main loader on refresh
    if (!isRefreshing) {
      setLoading(true);
    }
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error("Gagal memuat detail resep");
      }
      const data = (await response.json()) as RecipeDetail;
      setRecipe(data);
      setError(null);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(message);
      // Alert is optional if you have a good error screen
      // Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [id, isRefreshing]);

  useEffect(() => {
    fetchRecipeDetails();
  }, [fetchRecipeDetails]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRecipeDetails();
  }, [fetchRecipeDetails]);

  const handleDelete = () => {
    if (!recipe) return;

    Alert.alert("Hapus Resep", "Apakah Anda yakin ingin menghapus resep ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Gagal menghapus resep");
            }

            Alert.alert("Sukses", "Resep berhasil dihapus.");
            router.back();
          } catch (e) {
            const message =
              e instanceof Error ? e.message : "An unexpected error occurred.";
            Alert.alert("Error", message);
          }
        },
      },
    ]);
  };

  const handleUpdate = () => {
    if (!recipe) return;
    router.push(`/recipe/${recipe.id}/edit`);
  };

  const isOwner = user && recipe && user.id === recipe.owner_id;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-amber-50">
        <ActivityIndicator size="large" color="#fb923c" />
        <Text className="mt-4 text-lg text-amber-700 font-semibold">
          Memuat Resep...
        </Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-red-50">
        <Feather name="alert-triangle" size={48} color="#ef4444" />
        <Text className="text-red-600 text-xl font-bold mt-4 text-center">
          Oops! Terjadi Kesalahan
        </Text>
        <Text className="text-red-500 text-base my-2 text-center">
          {error || "Resep yang Anda cari tidak dapat ditemukan."}
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="mt-6 bg-red-500 py-3 px-6 rounded-full"
        >
          <Text className="text-white font-bold text-base">Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Stack.Screen
        options={{ title: recipe.title, headerBackTitle: "Kembali" }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#fb923c"
          />
        }
      >
        {/* --- Image Header --- */}
        {recipe.image_url && (
          <Image
            source={{ uri: recipe.image_url }}
            className="w-full h-72"
            resizeMode="cover"
          />
        )}

        {/* --- Content Body --- */}
        <View className="bg-slate-50 -mt-8 rounded-t-3xl p-6">
          {/* --- Title and Actions --- */}
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-3xl font-extrabold text-slate-800 flex-1 mr-4">
              {recipe.title}
            </Text>
            {isOwner && (
              <View className="flex-row items-center gap-x-4">
                <TouchableOpacity
                  onPress={handleUpdate}
                  className="p-3 bg-blue-100 rounded-full"
                >
                  <Feather name="edit-2" size={20} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  className="p-3 bg-red-100 rounded-full"
                >
                  <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* --- Description --- */}
          <Text className="text-base text-slate-600 leading-relaxed mb-6">
            {recipe.description}
          </Text>

          {/* --- Ingredients Section --- */}
          <View className="border-t border-slate-200 pt-6">
            <Text className="text-2xl font-bold text-slate-800 mb-4">
              Bahan-bahan
            </Text>
            <View className="space-y-3">
              {recipe.ingredients.map((ingredient) => (
                <View
                  key={ingredient.id}
                  className="flex-row items-center gap-x-4"
                >
                  <View className="w-2 h-2 bg-amber-400 rounded-full" />
                  <Text className="text-base text-slate-700 flex-1">
                    {ingredient.name}
                  </Text>
                  <Text className="text-base text-slate-500 font-medium">
                    {ingredient.quantity}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* --- Instructions Section --- */}
          <View className="border-t border-slate-200 mt-8 pt-6 mb-8">
            <Text className="text-2xl font-bold text-slate-800 mb-4">
              Instruksi
            </Text>
            <Text className="text-base text-slate-700 leading-loose whitespace-pre-line">
              {recipe.instructions}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
