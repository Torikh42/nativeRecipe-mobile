import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

export default function TabLayout() {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      {token && (
        <>
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color }: { color: string }) => (
                <IconSymbol size={28} name="person" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="add-recipe"
            options={{
              title: "Tambah Resep",
              tabBarIcon: ({ color }: { color: string }) => (
                <IconSymbol size={28} name="plus.circle" color={color} />
              ),
            }}
          />
        </>
      )}
      <Tabs.Screen name="recipe/[id]" options={{ href: null }} />
    </Tabs>
  );
}
