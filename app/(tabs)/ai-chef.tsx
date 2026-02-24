import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image as RNImage,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import * as ImagePicker from "expo-image-picker";

const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
    })
  ),
  instructions: z.string(),
});

export default function AiChefScreen() {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const {
    object: textRecipe,
    submit: submitText,
    isLoading: isTextLoading,
  } = useObject({
    api: `${API_URL}/api/ai/generate-recipe`,
    schema: RecipeSchema,
    onError: (error: any) => {
      Alert.alert("Gagal", error.message || "Gagal memproses permintaan.");
    },
  });

  const {
    object: imageRecipe,
    submit: submitImage,
    isLoading: isImageLoading,
  } = useObject({
    api: `${API_URL}/api/ai/identify-food`,
    schema: RecipeSchema,
    onError: (error: any) => {
      Alert.alert("Gagal", error.message || "Gagal memproses permintaan.");
    },
  });

  const loading = isTextLoading || isImageLoading;
  const recipe = activeTab === "text" ? textRecipe : imageRecipe;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleTakeImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Izin Ditolak", "Membutuhkan izin kamera untuk mengambil foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleGenerateValues = () => {
    if (activeTab === "text") {
      if (!ingredientsInput.trim()) {
        Alert.alert("Input Kosong", "Silakan masukkan daftar bahan terlebih dahulu.");
        return;
      }
      const ingredients = ingredientsInput
        .split(/[,\n]/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
      submitText({ ingredients });
    } else {
      if (!selectedImage) {
        Alert.alert("Belum ada foto", "Silakan upload atau ambil foto makanan terlebih dahulu.");
        return;
      }
      submitImage({ image: selectedImage });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        <View className="py-6">
          <Text className="text-3xl font-bold text-secondary mb-2">
            AI Chef 👨‍🍳
          </Text>
          <Text className="text-gray-500 mb-6">
            Punya bahan apa di kulkas? Atau punya foto makanan? Biarkan AI berkreasi!
          </Text>

          {/* Tabs */}
          <View className="flex-row mb-6 bg-surface rounded-xl p-1 border border-gray-100">
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg items-center ${
                activeTab === "text" ? "bg-primary" : "bg-transparent"
              }`}
              onPress={() => setActiveTab("text")}
            >
              <Text
                className={`font-bold ${
                  activeTab === "text" ? "text-white" : "text-gray-500"
                }`}
              >
                Tulis Bahan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg items-center ${
                activeTab === "image" ? "bg-primary" : "bg-transparent"
              }`}
              onPress={() => setActiveTab("image")}
            >
              <Text
                className={`font-bold ${
                  activeTab === "image" ? "text-white" : "text-gray-500"
                }`}
              >
                Upload Foto
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            {activeTab === "text" ? (
              <>
                <Text className="text-gray-700 font-medium mb-2">
                  Daftar Bahan (pisahkan dengan koma)
                </Text>
                <TextInput
                  className="w-full p-4 bg-surface rounded-2xl border border-gray-100 text-secondary shadow-sm h-32 text-start"
                  placeholder="Contoh: Telur, Bawang Merah, Kecap, Ayam..."
                  placeholderTextColor="#A0AEC0"
                  multiline
                  textAlignVertical="top"
                  value={ingredientsInput}
                  onChangeText={setIngredientsInput}
                />
              </>
            ) : (
              <View>
                {!selectedImage ? (
                  <View className="flex-row space-x-4">
                    <TouchableOpacity
                      className="flex-1 bg-surface border border-dashed border-gray-300 p-8 rounded-2xl items-center justify-center space-y-2 h-40"
                      onPress={handlePickImage}
                    >
                      <Text className="text-3xl">🖼️</Text>
                      <Text className="text-gray-500 text-center font-medium">Galeri</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-surface border border-dashed border-gray-300 p-8 rounded-2xl items-center justify-center space-y-2 h-40"
                      onPress={handleTakeImage}
                    >
                      <Text className="text-3xl">📸</Text>
                      <Text className="text-gray-500 text-center font-medium">Kamera</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="items-center">
                    <View className="relative w-full h-64 rounded-2xl overflow-hidden mb-4 border border-gray-200">
                      <RNImage 
                        source={{ uri: selectedImage }} 
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <TouchableOpacity 
                      onPress={() => setSelectedImage(null)}
                      className="bg-red-50 py-2 px-4 rounded-full border border-red-100"
                    >
                      <Text className="text-red-500 font-medium">Hapus & Ganti Foto</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            className="bg-primary p-4 rounded-2xl items-center shadow-md shadow-orange-200"
            onPress={handleGenerateValues}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold">
                {activeTab === "text" ? "✨ Buat Resep Ajaib" : "🔍 Analisa & Buat Resep"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {recipe && (
          <View className="bg-surface rounded-3xl p-6 shadow-sm border border-gray-100 mb-10">
            {recipe.title && (
              <Text className="text-2xl font-bold text-primary mb-2">
                {recipe.title}
              </Text>
            )}
            {recipe.description && (
              <Text className="text-gray-600 italic mb-6">
                {recipe.description}
              </Text>
            )}

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-bold text-secondary mb-3">
                  Bahan-bahan:
                </Text>
                {recipe.ingredients.map((ing, index) => (
                  <View key={index} className="flex-row justify-between mb-2">
                    <Text className="text-gray-700 font-medium">• {ing?.name}</Text>
                    <Text className="text-gray-500">{ing?.quantity}</Text>
                  </View>
                ))}
              </View>
            )}

            {recipe.instructions && (
              <View>
                <Text className="text-lg font-bold text-secondary mb-3">
                  Cara Memasak:
                </Text>
                <Text className="text-gray-700 leading-relaxed">
                  {recipe.instructions}
                </Text>
              </View>
            )}

            {loading && (
              <View className="items-center py-4">
                <ActivityIndicator color="#F97316" />
                <Text className="text-gray-400 mt-2 text-sm">Sedang meracik resep...</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
