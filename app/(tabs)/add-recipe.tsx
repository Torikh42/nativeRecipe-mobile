import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface Ingredient {
  name: string;
  quantity: string;
}

export default function AddRecipeScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "" },
  ]);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { token, user } = useAuth();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleIngredientChange = (
    index: number,
    field: "name" | "quantity",
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Menggunakan token untuk cek login
    if (!token || !user?.id) {
      Alert.alert("Error", "Anda harus login untuk menambah resep.");
      setIsLoading(false);
      return;
    }

    if (!title.trim() || !description.trim() || !instructions.trim()) {
      Alert.alert(
        "Error",
        "Judul, deskripsi, dan instruksi tidak boleh kosong."
      );
      setIsLoading(false);
      return;
    }

    const isIngredientsEmpty = ingredients.some(
      (ing) => ing.name.trim() === "" || ing.quantity.trim() === ""
    );
    if (isIngredientsEmpty) {
      Alert.alert("Error", "Nama dan jumlah bahan tidak boleh kosong.");
      setIsLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      instructions,
      ingredients,
      owner_id: user.id, // Menambahkan owner_id dari user context
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    if (image) {
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("image", {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/recipes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          (errorData as { error?: string }).error ||
          "Gagal mengirim data. Pastikan backend berjalan.";
        throw new Error(errorMessage);
      }

      Alert.alert("Sukses", "Resep berhasil ditambahkan!");
      router.replace("/");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-orange-50"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="items-center py-8 px-5">
        <View className="bg-orange-500 w-16 h-16 rounded-full items-center justify-center mb-4 shadow-lg">
          <Ionicons name="restaurant" size={32} color="#fff" />
        </View>
        <Text className="text-4xl font-bold text-gray-800 mb-2 text-center">
          Tambah Resep Baru
        </Text>
        <Text className="text-gray-600 text-lg text-center">
          Bagikan kreasi kuliner Anda dengan komunitas
        </Text>
      </View>

      <View className="bg-white mx-4 rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
        <View className="p-6 space-y-8">
          {/* Basic Info Section */}
          <View className="space-y-6">
            <View className="flex-row items-center space-x-3 mb-4">
              <Ionicons
                name="document-text-outline"
                size={24}
                color={Colors.light.tint}
              />
              <Text className="text-xl font-semibold text-gray-800">
                Informasi Dasar
              </Text>
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-800">
                Nama Resep *
              </Text>
              <TextInput
                className="h-12 border-2 border-orange-100 rounded-md px-4 text-gray-800 bg-white focus:border-orange-500"
                placeholder="Masukkan nama resep yang menarik..."
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-800">
                Deskripsi Singkat *
              </Text>
              <TextInput
                className="border-2 border-orange-100 rounded-md px-4 py-3 text-gray-800 bg-white focus:border-orange-500 min-h-20"
                placeholder="Ceritakan sedikit tentang resep ini..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Image Upload Section */}
          <View className="space-y-4">
            <View className="flex-row items-center space-x-3 mb-4">
              <Ionicons
                name="camera-outline"
                size={24}
                color={Colors.light.tint}
              />
              <Text className="text-xl font-semibold text-gray-800">
                Foto Resep
              </Text>
            </View>

            <Pressable
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center hover:border-orange-500"
              onPress={pickImage}
            >
              {image ? (
                <View className="space-y-4 items-center">
                  <Image
                    source={{ uri: image }}
                    className="w-full h-48 rounded-lg"
                    style={{ resizeMode: "cover" }}
                  />
                  <Pressable
                    className="bg-orange-500 rounded-lg px-6 py-2 mt-2"
                    onPress={pickImage}
                  >
                    <Text className="text-white font-medium">Ganti Foto</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons
                    name="cloud-upload-outline"
                    size={48}
                    color={Colors.light.tint}
                  />
                  <Text className="text-lg font-medium text-gray-700 mt-4 mb-2">
                    Upload Foto Resep
                  </Text>
                  <Text className="text-sm text-gray-500 mb-4">
                    PNG atau JPEG, maksimal 5MB
                  </Text>
                  <View className="bg-orange-500 rounded-lg px-6 py-3">
                    <Text className="text-white font-medium">Pilih Foto</Text>
                  </View>
                </View>
              )}
            </Pressable>
          </View>

          {/* Ingredients Section */}
          <View className="space-y-6">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center space-x-3">
                <Ionicons
                  name="list-outline"
                  size={24}
                  color={Colors.light.tint}
                />
                <Text className="text-xl font-semibold text-gray-800">
                  Bahan-bahan
                </Text>
              </View>
              <Pressable
                className="bg-orange-500 flex-row items-center px-3 py-2 rounded-lg shadow-md"
                onPress={addIngredient}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text className="text-white font-medium ml-2">Tambah</Text>
              </Pressable>
            </View>

            <View className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <View
                  key={index}
                  className="bg-orange-50 rounded-lg p-4 border border-gray-200"
                >
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-lg font-semibold text-orange-600">
                      {index + 1}.
                    </Text>
                    <View className="flex-1 space-y-3">
                      <TextInput
                        className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-white focus:border-orange-500"
                        placeholder="Nama bahan (cth: Tepung terigu)"
                        placeholderTextColor="#9CA3AF"
                        value={ingredient.name}
                        onChangeText={(value) =>
                          handleIngredientChange(index, "name", value)
                        }
                      />
                      <TextInput
                        className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-white focus:border-orange-500"
                        placeholder="Jumlah (cth: 200 gr)"
                        placeholderTextColor="#9CA3AF"
                        value={ingredient.quantity}
                        onChangeText={(value) =>
                          handleIngredientChange(index, "quantity", value)
                        }
                      />
                    </View>
                    {ingredients.length > 1 && (
                      <Pressable
                        className="bg-red-100 rounded-lg p-2 hover:bg-red-200"
                        onPress={() => removeIngredient(index)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#EF4444"
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions Section */}
          <View className="space-y-4">
            <View className="flex-row items-center space-x-3">
              <Ionicons
                name="book-outline"
                size={24}
                color={Colors.light.tint}
              />
              <Text className="text-xl font-semibold text-gray-800">
                Cara Memasak
              </Text>
            </View>

            <View className="bg-orange-50 rounded-xl p-4 border border-gray-200">
              <TextInput
                className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 bg-white focus:border-orange-500 min-h-40"
                placeholder="Tulis langkah-langkah memasak secara detail...\n\n1. Siapkan semua bahan\n2. Panaskan minyak dalam wajan\n3. ..."
                placeholderTextColor="#9CA3AF"
                value={instructions}
                onChangeText={setInstructions}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-4 pt-6 border-t border-gray-200">
            <Pressable
              className={`h-14 bg-orange-500 rounded-xl shadow-lg items-center justify-center ${
                isLoading ? "opacity-70" : ""
              }`}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center space-x-3">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white font-semibold text-lg">
                    Menyimpan Resep...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center space-x-3">
                  <Ionicons name="save-outline" size={22} color="#fff" />
                  <Text className="text-white font-semibold text-lg">
                    Simpan Resep
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              className="h-14 border-2 border-gray-300 rounded-xl items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-gray-700 font-medium text-lg">Batal</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Footer Tips */}
      <View className="bg-white/70 mx-4 rounded-xl p-6 border border-orange-100 mb-8">
        <View className="flex-row items-center mb-3">
          <Text className="text-lg mr-2">💡</Text>
          <Text className="text-lg font-semibold text-gray-800">
            Tips untuk Resep yang Menarik
          </Text>
        </View>
        <View className="space-y-1">
          <Text className="text-sm text-gray-600">
            • Gunakan foto yang terang dan menarik
          </Text>
          <Text className="text-sm text-gray-600">
            • Tulis langkah-langkah yang jelas dan detail
          </Text>
          <Text className="text-sm text-gray-600">
            • Cantumkan takaran bahan dengan tepat
          </Text>
          <Text className="text-sm text-gray-600">
            • Bagikan tips khusus untuk hasil terbaik
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
