import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { subscriptionAPI, SubscriptionPlan, SubscriptionStatus } from '@/lib/subscriptionApi';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [plansData, statusData] = await Promise.all([
        subscriptionAPI.getPlans(token),
        subscriptionAPI.getStatus(token),
      ]);
      setPlans(plansData);
      setSubscriptionStatus(statusData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      Alert.alert('Error', 'Gagal memuat data subscription');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    if (!token) {
      Alert.alert('Login Required', 'Silakan login untuk berlangganan');
      router.push('/(auth)/login');
      return;
    }

    setIsProcessing(planType);
    try {
      const response = await subscriptionAPI.createSubscription(token, planType, {
        email: user?.email,
      });

      if (response.success && response.data.redirectUrl) {
        // Open Midtrans payment page
        const supported = await Linking.canOpenURL(response.data.redirectUrl);
        if (supported) {
          await Linking.openURL(response.data.redirectUrl);
          Alert.alert(
            'Payment Started',
            'Silakan selesaikan pembayaran di browser Anda. Status akan otomatis terupdate setelah pembayaran berhasil.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Refresh status after a delay
                  setTimeout(() => {
                    loadData();
                  }, 3000);
                },
              },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      Alert.alert('Error', error.message || 'Gagal membuat subscription');
    } finally {
      setIsProcessing(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FFA500" />
        <Text className="mt-4 text-gray-600">Memuat subscription...</Text>
      </SafeAreaView>
    );
  }

  const isPro = subscriptionStatus?.isPro;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFA500']}
            tintColor="#FFA500"
          />
        }
      >
        {/* Header */}
        <View className="items-center py-8 bg-gradient-to-b from-orange-500 to-orange-400 rounded-b-3xl">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
            <Ionicons name={isPro ? 'diamond' : 'restaurant'} size={40} color="#FFA500" />
          </View>
          <Text className="text-3xl font-bold text-white mb-2">
            {isPro ? 'Pro Chef' : 'Upgrade to Pro'}
          </Text>
          {isPro ? (
            <View className="items-center">
              <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full">
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">Active Subscription</Text>
              </View>
              {subscriptionStatus?.daysRemaining ? (
                <Text className="text-white/90 mt-2 text-sm">
                  {subscriptionStatus.daysRemaining} hari tersisa
                </Text>
              ) : null}
              {subscriptionStatus?.planType ? (
                <Text className="text-white/80 mt-1 text-xs capitalize">
                  {subscriptionStatus.planType} plan
                </Text>
              ) : null}
            </View>
          ) : (
            <Text className="text-white/90 text-center px-8">
              Dapatkan akses unlimited ke semua fitur premium
            </Text>
          )}
        </View>

        {/* Current Status Card */}
        {isPro && subscriptionStatus && (
          <View className="mx-4 mt-6 bg-white rounded-2xl p-5 shadow-md">
            <Text className="text-lg font-bold text-gray-800 mb-3">Subscription Details</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Plan Type</Text>
              <Text className="font-semibold text-gray-800 capitalize">
                {subscriptionStatus.planType}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Status</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="font-semibold text-green-600 capitalize">
                  {subscriptionStatus.status}
                </Text>
              </View>
            </View>
            {subscriptionStatus.endDate && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Expires On</Text>
                <Text className="font-semibold text-gray-800">
                  {new Date(subscriptionStatus.endDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Features */}
        <View className="mx-4 mt-6 bg-white rounded-2xl p-5 shadow-md">
          <Text className="text-lg font-bold text-gray-800 mb-4">Pro Features</Text>
          <View className="space-y-3">
            {[
              { icon: 'infinite', text: 'Unlimited AI Recipe Generation' },
              { icon: 'lock-open', text: 'Access to Premium Recipes' },
              { icon: 'download', text: 'Download Recipe as PDF' },
              { icon: 'close-circle', text: 'Ad-free Experience' },
              { icon: 'star', text: 'Priority Support' },
            ].map((feature, index) => (
              <View key={index} className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name={feature.icon as any} size={18} color="#FFA500" />
                </View>
                <Text className="text-gray-700 flex-1">{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Plans */}
        {!isPro && plans.length > 0 && (
          <View className="mx-4 mt-6 mb-8">
            <Text className="text-lg font-bold text-gray-800 mb-4 text-center">Choose Your Plan</Text>
            {plans.map((plan) => (
              <View
                key={plan.id}
                className={`bg-white rounded-2xl p-5 shadow-md mb-4 ${
                  plan.popular ? 'border-2 border-orange-500' : ''
                }`}
              >
                {plan.popular && (
                  <View className="absolute -top-3 right-4 bg-orange-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">POPULAR</Text>
                  </View>
                )}
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-xl font-bold text-gray-800">{plan.name}</Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {plan.duration} {plan.durationUnit}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-orange-500">
                      {formatPrice(plan.price)}
                    </Text>
                    {plan.savings ? (
                      <Text className="text-green-600 text-xs font-semibold">
                        Save {plan.savings}%
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View className="border-t border-gray-100 pt-4 mb-4">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 8 }} />
                      <Text className="text-gray-600 text-sm flex-1">{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  className={`py-3 rounded-xl ${
                    plan.popular ? 'bg-orange-500' : 'bg-orange-100'
                  }`}
                  onPress={() => handleSubscribe(plan.id as 'monthly' | 'yearly')}
                  disabled={isProcessing !== null}
                >
                  {isProcessing === plan.id ? (
                    <ActivityIndicator color={plan.popular ? '#fff' : '#FFA500'} />
                  ) : (
                    <Text
                      className={`text-center font-bold ${
                        plan.popular ? 'text-white' : 'text-orange-600'
                      }`}
                    >
                      Subscribe Now
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Payment Methods Info */}
        <View className="mx-4 mb-8 bg-gray-100 rounded-xl p-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Payment Methods Available:
          </Text>
          <View className="flex-row flex-wrap justify-center gap-2">
            {['BCA', 'Mandiri', 'BRI', 'QRIS', 'GoPay', 'OVO', 'Dana'].map((method) => (
              <View key={method} className="bg-white px-3 py-1.5 rounded-lg">
                <Text className="text-xs font-medium text-gray-600">{method}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
