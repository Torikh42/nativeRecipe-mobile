import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AiRecipeResponse {
  title: string;
  description: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string;
}

export default function AiChefScreen() {
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [recipe, setRecipe] = useState<AiRecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateValues = async () => {
    if (!ingredientsInput.trim()) {
      Alert.alert("Input Kosong", "Silakan masukkan daftar bahan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setRecipe(null);

    try {
      // Split by comma or newline and clean up
      const ingredients = ingredientsInput
        .split(/[,\n]/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/ai/generate-recipe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingredients }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat resep.");
      }

      setRecipe(data);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Gagal", error.message);
      } else {
        Alert.alert("Error", "Terjadi kesalahan tidak diketahui.");
      }
    } finally {
      setLoading(false);
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
            Punya bahan apa di kulkas? Tulis di sini, dan biarkan AI membuatkan
            resep spesial untukmu!
          </Text>

          <View className="mb-6">
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
                ✨ Buat Resep Ajaib
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {recipe && (
          <View className="bg-surface rounded-3xl p-6 shadow-sm border border-gray-100 mb-10">
            <Text className="text-2xl font-bold text-primary mb-2">
              {recipe.title}
            </Text>
            <Text className="text-gray-600 italic mb-6">
              {recipe.description}
            </Text>

            <View className="mb-6">
              <Text className="text-lg font-bold text-secondary mb-3">
                Bahan-bahan:
              </Text>
              {recipe.ingredients.map((ing, index) => (
                <View key={index} className="flex-row justify-between mb-2">
                  <Text className="text-gray-700 font-medium">• {ing.name}</Text>
                  <Text className="text-gray-500">{ing.quantity}</Text>
                </View>
              ))}
            </View>

            <View>
              <Text className="text-lg font-bold text-secondary mb-3">
                Cara Memasak:
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                {recipe.instructions}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
