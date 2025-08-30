import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";

export default function AddRecipeScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

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

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!session?.access_token) {
      Alert.alert("Error", "Anda harus login untuk menambah resep.");
      setIsLoading(false);
      return;
    }

    if (!title.trim() || !description.trim() || !instructions.trim()) {
      Alert.alert("Error", "Judul, deskripsi, dan instruksi tidak boleh kosong.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("instructions", instructions);

    if (image) {
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append("image", {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    try {
      const response = await fetch("http://192.168.1.7:3001/api/recipes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          (errorData as { error?: string }).error || "Gagal mengirim data. Pastikan backend berjalan.";
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
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20, backgroundColor: "#ECFEFF" }}>
      <View className="w-full max-w-lg self-center bg-white p-6 rounded-2xl shadow-lg">
        <Text className="text-3xl font-bold mb-6 text-center text-gray-800">Tambah Resep Baru</Text>

        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 bg-gray-50 text-gray-800"
          placeholder="Judul Resep"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 bg-gray-50 text-gray-800 h-28 align-top"
          placeholder="Deskripsi Singkat"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 bg-gray-50 text-gray-800 h-32 align-top"
          placeholder="Instruksi & Cara Memasak"
          placeholderTextColor="#888"
          value={instructions}
          onChangeText={setInstructions}
          multiline
        />

        <TouchableOpacity 
          className="bg-gray-200 p-4 rounded-lg items-center mb-4"
          onPress={pickImage}
        >
          <Text className="text-gray-800 font-bold">Pilih Gambar</Text>
        </TouchableOpacity>

        {image && (
          <Image source={{ uri: image }} className="w-full h-48 rounded-lg mb-4" />
        )}
        
        <TouchableOpacity 
          className="bg-blue-500 p-4 rounded-lg items-center mt-2.5"
          onPress={handleSubmit} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-bold">Simpan Resep</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}