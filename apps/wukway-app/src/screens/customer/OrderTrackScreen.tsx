import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';


type OrderTrackRouteProp = RouteProp<RootStackParamList, 'OrderTrack'>;
type OrderTrackNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderTrack'>;

type Props = {
  route: OrderTrackRouteProp;
  navigation: OrderTrackNavigationProp;
};

export default function OrderTrackScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data) {
        setOrder(res.data);
        return;
      }
    } catch (e) {
      // Look up in local storage if backend is offline
      try {
        const existingRaw = (await AsyncStorage.getItem('localUserOrders')) || '[]';
        const existing = JSON.parse(existingRaw);
        const match = existing.find((o: any) => o.id === orderId);
        if (match) {
          setOrder(match);
        }
      } catch (storeErr) {
        // ignore
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchOrder();
    // Auto-poll every 3.5 seconds to track vendor kitchen updates live
    const interval = setInterval(fetchOrder, 3500);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading && !order) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E13328" />
        <Text style={styles.loadingText}>Fetching live ticket...</Text>
      </SafeAreaView>
    );
  }

  const status = order?.status || 'PENDING';
  const pickupToken = order?.pickupToken || `#WW-${(order?.id || '4821').substring(0, 4).toUpperCase()}`;
  const etaMinutes = order?.declaredEtaMinutes || 10;

  // Stepper helper
  const getStepIndex = () => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'ACCEPTED':
      case 'PREPARING':
        return 1;
      case 'READY':
        return 2;
      case 'COLLECTED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex();

  const getStatusHeadline = () => {
    switch (status) {
      case 'PENDING':
        return {
          title: 'Order Placed!',
          subtitle: 'Stall is reviewing your ticket and preparing kitchen...',
          badgeColor: '#FFC22E',
          badgeText: 'WAITING ACCEPTANCE',
        };
      case 'ACCEPTED':
      case 'PREPARING':
        return {
          title: 'Cooking in Kitchen 🔥',
          subtitle: `Timed to your arrival (~${etaMinutes} min walk). Eat it fresh & piping hot!`,
          badgeColor: '#FF9800',
          badgeText: 'PREPARING NOW',
        };
      case 'READY':
        return {
          title: 'Ready for Pickup! 🛎️',
          subtitle: 'Your food is packed & waiting at the counter. Show token below!',
          badgeColor: '#4CAF50',
          badgeText: 'READY AT COUNTER',
        };
      case 'COLLECTED':
        return {
          title: 'Order Collected 🎉',
          subtitle: 'Thank you for skipping the queue with WukWay!',
          badgeColor: '#2B1710',
          badgeText: 'COMPLETED',
        };
      default:
        return {
          title: 'Order Tracking',
          subtitle: 'Live kitchen queue updates',
          badgeColor: '#E13328',
          badgeText: status,
        };
    }
  };

  const headline = getStatusHeadline();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('CustomerHome')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Pickup Ticket</Text>
        <TouchableOpacity
          onPress={() => {
            setRefreshing(true);
            fetchOrder();
          }}
          style={styles.refreshBtn}
        >
          <Text style={styles.refreshText}>{refreshing ? '...' : '↻'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Announcement Card */}
        <View style={styles.heroCard}>
          <View style={[styles.statusBadge, { backgroundColor: headline.badgeColor }]}>
            <Text style={styles.statusBadgeText}>{headline.badgeText}</Text>
          </View>
          <Text style={styles.heroTitle}>{headline.title}</Text>
          <Text style={styles.heroSubtitle}>{headline.subtitle}</Text>
        </View>

        {/* Big Pickup Token Card (Swiggy / Zomato style ticket) */}
        <View style={styles.tokenCard}>
          <View style={styles.tokenTop}>
            <Text style={styles.tokenLabel}>YOUR PICKUP TOKEN</Text>
            <Text style={styles.tokenNotice}>SHOW AT COUNTER</Text>
          </View>
          <View style={styles.tokenDisplay}>
            <Text style={styles.tokenNumber}>{pickupToken}</Text>
          </View>
          <View style={styles.tokenCutoutLeft} />
          <View style={styles.tokenCutoutRight} />
          <View style={styles.tokenDottedLine} />
          <View style={styles.tokenBottom}>
            <Text style={styles.stallName}>Stall: {order?.outlet?.name || 'Food Stall'}</Text>
            <Text style={styles.stallZone}>📍 {order?.outlet?.cityZone || 'Campus Lane'}</Text>
          </View>
        </View>

        {/* Live Stepper */}
        <View style={styles.stepperCard}>
          <Text style={styles.stepperHeading}>KITCHEN PROGRESS</Text>
          <View style={styles.stepRow}>
            <View style={[styles.stepCircle, currentStep >= 0 && styles.stepActive]}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, currentStep >= 0 && styles.textActive]}>Ticket Received</Text>
              <Text style={styles.stepDesc}>Order captured & sent to kitchen display</Text>
            </View>
          </View>

          <View style={[styles.stepLine, currentStep >= 1 && styles.lineActive]} />

          <View style={styles.stepRow}>
            <View style={[styles.stepCircle, currentStep >= 1 && styles.stepActive]}>
              <Text style={styles.stepNum}>2</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, currentStep >= 1 && styles.textActive]}>Cooking Fresh</Text>
              <Text style={styles.stepDesc}>Vendor timed cooking to your {etaMinutes}m ETA</Text>
            </View>
          </View>

          <View style={[styles.stepLine, currentStep >= 2 && styles.lineActive]} />

          <View style={styles.stepRow}>
            <View style={[styles.stepCircle, currentStep >= 2 && styles.stepActive]}>
              <Text style={styles.stepNum}>3</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, currentStep >= 2 && styles.textActive]}>Ready for Pickup</Text>
              <Text style={styles.stepDesc}>Packed & standing by at counter</Text>
            </View>
          </View>

          <View style={[styles.stepLine, currentStep >= 3 && styles.lineActive]} />

          <View style={styles.stepRow}>
            <View style={[styles.stepCircle, currentStep >= 3 && styles.stepActive]}>
              <Text style={styles.stepNum}>4</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, currentStep >= 3 && styles.textActive]}>Collected</Text>
              <Text style={styles.stepDesc}>Zero-queue pickup complete</Text>
            </View>
          </View>
        </View>

        {/* Order Details Breakdown */}
        <View style={styles.orderSummaryCard}>
          <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
          {(order?.items || []).map((item: any, idx: number) => (
            <View key={idx} style={styles.summaryItemRow}>
              <Text style={styles.summaryItemQty}>{item.quantity}x</Text>
              <Text style={styles.summaryItemName}>{item.menuItem?.name || item.name || 'Dish'}</Text>
              <Text style={styles.summaryItemPrice}>₹{parseFloat(item.unitPrice || '0') * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid (UPI)</Text>
            <Text style={styles.totalAmount}>₹{order?.totalAmount || '0'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#806c61',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd2',
    backgroundColor: '#fff',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f5eee6',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#2B1710',
    fontWeight: '800',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2B1710',
    letterSpacing: -0.5,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffe9e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    color: '#E13328',
    fontSize: 16,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  heroCard: {
    backgroundColor: '#2B1710',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFC22E',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#ddc9bf',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  tokenCard: {
    backgroundColor: '#FFC22E',
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  tokenTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2B1710',
    letterSpacing: 1,
  },
  tokenNotice: {
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: '#2B1710',
    color: '#FFC22E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tokenDisplay: {
    marginVertical: 14,
    alignItems: 'center',
  },
  tokenNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: '#2B1710',
    letterSpacing: 4,
  },
  tokenCutoutLeft: {
    position: 'absolute',
    left: -12,
    bottom: 50,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFBF2',
  },
  tokenCutoutRight: {
    position: 'absolute',
    right: -12,
    bottom: 50,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFBF2',
  },
  tokenDottedLine: {
    borderTopWidth: 1.5,
    borderTopColor: '#2B171040',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  tokenBottom: {
    marginTop: 4,
  },
  stallName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1710',
  },
  stallZone: {
    fontSize: 12,
    fontWeight: '700',
    color: '#523429',
    marginTop: 2,
  },
  stepperCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    padding: 20,
    marginBottom: 20,
  },
  stepperHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#806c61',
    letterSpacing: 1,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eadfd2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepActive: {
    backgroundColor: '#E13328',
  },
  stepNum: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9e8c80',
  },
  textActive: {
    color: '#2B1710',
  },
  stepDesc: {
    fontSize: 12,
    color: '#806c61',
    marginTop: 2,
    fontWeight: '500',
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: '#eadfd2',
    marginLeft: 13,
    marginVertical: 2,
  },
  lineActive: {
    backgroundColor: '#E13328',
  },
  orderSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    padding: 20,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#806c61',
    letterSpacing: 1,
    marginBottom: 14,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryItemQty: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E13328',
    width: 26,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#2B1710',
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2B1710',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#eadfd2',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2B1710',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E13328',
  },
});
