import { Recipe } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

import { Colors } from "@/constants/Colors";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/recipes`;

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "An unexpected error occurred.";
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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/recipe/[id]",
          params: { id: item.id.toString() },
        })
      }
    >
      <View className="bg-surface overflow-hidden mb-6 rounded-3xl shadow-sm border border-gray-50 pb-4">
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            className="w-full h-56"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-56 bg-gray-100 items-center justify-center">
             <Text className="text-gray-300">No Image</Text>
          </View>
        )}
        <View className="px-5 pt-4">
          <Text className="text-xl font-bold text-secondary mb-1">{item.title}</Text>
          <Text className="text-sm text-gray-500 line-clamp-2" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
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
        <Text className="text-red-500 text-base mb-2 text-center">
          Error: {error}
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Pastikan backend berjalan dan IP address sudah benar.
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-6 py-6 bg-surface shadow-sm mb-2">
        <View>
          <Text className="text-2xl font-bold text-secondary">
            Jelajahi Resep
          </Text>
          <Text className="text-gray-500">Temukan inspirasi memasak hari ini</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-accent p-2 rounded-full"
        >
          {/* Simple logout icon placeholder or text if no icon lib available */}
          <Text className="text-primary font-bold text-xs px-2">Keluar</Text>
        </TouchableOpacity>
      </View>

      {recipes.length > 0 ? (
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#FF6B6B"]}
            />
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-lg font-bold text-gray-400 mb-2">
            Belum ada resep.
          </Text>
          <Text className="text-base text-gray-500 text-center mb-6">
            Mulai tambahkan resep pertamamu sekarang!
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="bg-primary py-3 px-6 rounded-full shadow-lg shadow-orange-200"
          >
            <Text className="text-white font-bold">Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
