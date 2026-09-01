import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { RootStackParamList } from '../../navigation/AppNavigator';
import BottomNav from '../../components/BottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

type CustomerHomeProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CustomerHome'>;
};

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '✨' },
  { id: 'momos', name: 'Momos', icon: '🥟' },
  { id: 'rolls', name: 'Rolls & Wraps', icon: '🌯' },
  { id: 'biryani', name: 'Biryani', icon: '🍚' },
  { id: 'chaat', name: 'Chaat & Snacks', icon: '🧆' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'shakes', name: 'Chai & Shakes', icon: '🥤' },
];

export default function CustomerHomeScreen({ navigation }: CustomerHomeProps) {
  const { signOut, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [dbUserId, setDbUserId] = useState<string | null>(null);

  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeBottomTab, setActiveBottomTab] = useState<'HOME' | 'ORDERS' | 'SCAN' | 'FEED'>('HOME');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Orders State (Active + History)
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const DEFAULT_CAMPUS_OUTLETS = [
    {
      id: 'out-1',
      name: 'Momo House',
      cityZone: 'Academic Block B - East Courtyard',
      cuisine: 'Steamed & Fried Dumplings, Thukpa',
      distance: '150m · 2 min walk',
      rating: 4.8,
      reviewCount: 342,
      status: 'OPEN',
      isApproved: true,
      usp: '⚡ Piping hot in 4 mins',
      priceRange: '₹80 for one',
      menuItems: [
        { id: 'm1', name: 'Steamed Veg Momos (6 pcs)', price: '80.00', isAvailable: true },
        { id: 'm2', name: 'Kurkure Paneer Momos (6 pcs)', price: '120.00', isAvailable: true },
        { id: 'm3', name: 'Darjeeling Chicken Momos (6 pcs)', price: '110.00', isAvailable: true },
        { id: 'm4', name: 'Spicy Schezwan Gravy Momos', price: '130.00', isAvailable: true },
      ],
    },
    {
      id: 'out-4',
      name: 'NK Varma Food Stall',
      cityZone: 'Science Court Book Cafe',
      cuisine: 'Biriyani, Momos & Rolls',
      distance: '200m · 3 min walk',
      rating: 4.9,
      reviewCount: 89,
      status: 'OPEN',
      isApproved: true,
      usp: '👑 Chef Special Dum Biryani',
      priceRange: '₹140 for one',
      menuItems: [
        { id: 'm-nk-1', name: 'Hyderabadi Chicken Biryani', price: '180.00', isAvailable: true },
        { id: 'm-nk-2', name: 'Veg Dum Biryani', price: '140.00', isAvailable: true },
        { id: 'm-nk-3', name: 'Steamed Chicken Momos (6 pcs)', price: '100.00', isAvailable: true },
      ],
    },
    {
      id: 'out-2',
      name: 'Rolls & Bowls',
      cityZone: 'Library Junction - Food Street',
      cuisine: 'Kolkata Kathi Rolls, Rice Bowls',
      distance: '300m · 4 min walk',
      rating: 4.9,
      reviewCount: 512,
      status: 'OPEN',
      isApproved: true,
      usp: '🔥 ₹99 Combo Meals',
      priceRange: '₹90 for one',
      menuItems: [
        { id: 'm5', name: 'Double Egg Chicken Roll', price: '90.00', isAvailable: true },
        { id: 'm6', name: 'Paneer Tikka Roll', price: '100.00', isAvailable: true },
        { id: 'm7', name: 'Crispy Veg Roll', price: '70.00', isAvailable: true },
        { id: 'm8', name: 'Butter Chicken Rice Bowl', price: '140.00', isAvailable: true },
      ],
    },
    {
      id: 'out-3',
      name: 'Southern Sambar & Dosas',
      cityZone: 'Hostel 4 Cafeteria Lane',
      cuisine: 'Ghee Podi Roast, Filter Coffee',
      distance: '450m · 6 min walk',
      rating: 4.7,
      reviewCount: 280,
      status: 'OPEN',
      isApproved: true,
      usp: '☕ ₹25 Degree Filter Coffee',
      priceRange: '₹75 for one',
      menuItems: [
        { id: 'm9', name: 'Ghee Podi Masala Dosa', price: '75.00', isAvailable: true },
        { id: 'm10', name: 'Steamed Idli Vada Combo', price: '60.00', isAvailable: true },
        { id: 'm11', name: 'Degree Filter Coffee', price: '25.00', isAvailable: true },
      ],
    },
  ];

  const fetchCustomerOrders = async (userId: string) => {
    try {
      const res = await api.get(`/orders/customer/${userId}`);
      const orders = res.data || [];
      if (orders.length > 0) {
        setOrderHistory(orders);
        const active = orders.find((o: any) =>
          ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status),
        );
        setActiveOrder(active || null);
        return;
      }
    } catch (e) {
      console.warn('Error fetching customer orders', e);
    }
    // Also load local stored orders
    try {
      const localRaw = (await AsyncStorage.getItem('localUserOrders')) || '[]';
      const local = JSON.parse(localRaw);
      if (local.length > 0) {
        setOrderHistory(local);
        const active = local.find((o: any) =>
          ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status),
        );
        setActiveOrder(active || null);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchOutlets = async () => {
    try {
      const res = await api.get('/outlets');
      if (res.data && res.data.length > 0) {
        setOutlets(res.data);
      } else {
        setOutlets(DEFAULT_CAMPUS_OUTLETS);
      }
    } catch (error) {
      console.warn('Using campus stall defaults', error);
      setOutlets(DEFAULT_CAMPUS_OUTLETS);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const init = async () => {
      try {
        let userId = 'demo-cust-id';
        try {
          const token = await getToken();
          if (token) {
            const syncRes = await api.post(
              '/users/sync',
              { role: 'CUSTOMER', email: clerkUser?.primaryEmailAddress?.emailAddress },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (syncRes.data?.id) userId = syncRes.data.id;
          }
        } catch (e) {
          console.warn('Sync fallback', e);
        }
        setDbUserId(userId);
        fetchCustomerOrders(userId);
      } catch (e) {
        console.warn('Init error', e);
      }
      fetchOutlets();
    };
    init();
  }, [clerkUser]);

  useEffect(() => {
    if (dbUserId) {
      const interval = setInterval(() => {
        fetchCustomerOrders(dbUserId);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [dbUserId]);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
      await signOut();
    } catch (e) {
      console.warn('Sign out', e);
    }
  };

  const switchToVendor = async () => {
    await AsyncStorage.setItem('appRole', 'VENDOR');
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/vendor';
    }
  };

  const handleChangePortal = async () => {
    await AsyncStorage.removeItem('appRole');
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Filter outlets
  const filteredOutlets = outlets.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.cuisine && o.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.cityZone && o.cityZone.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'under100') {
      return o.usp && (o.usp.includes('99') || o.usp.includes('95') || o.usp.includes('59'));
    }
    if (selectedFilter === 'topRated') {
      return (o.rating || 4.5) >= 4.8;
    }
    if (selectedFilter === 'veg') {
      return o.name.toLowerCase().includes('chaat') || (o.cuisine && o.cuisine.toLowerCase().includes('chaat'));
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Location & Role Switcher Bar */}
      <View style={styles.topHeader}>
        <View style={styles.locationContainer}>
          <View style={styles.locIconRow}>
            <Text style={styles.locPin}>📍</Text>
            <Text style={styles.locTitle}>North Campus · Food Lane</Text>
            <Text style={styles.locArrow}>▾</Text>
          </View>
          <Text style={styles.locSubtitle}>Walking distance pickups</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.changeRoleBtn} onPress={handleChangePortal}>
            <Text style={styles.changeRoleBtnText}>⇄ Switch Role</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchRolePill} onPress={switchToVendor}>
            <Text style={styles.switchRoleText}>🏪 Vendor Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutPill} onPress={handleSignOut}>
            <Text style={styles.logoutPillText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* VIEW 1: DISCOVER / HOME SCREEN                                            */}
      {/* ========================================================================= */}
      {activeBottomTab === 'HOME' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Swiggy/Zomato Banner */}
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>SKIP THE QUEUE · ZERO WAIT</Text>
            </View>
            <Text style={styles.heroTitle}>
              Order ahead.{'\n'}Collect it <Text style={styles.heroHighlight}>hot.</Text>
            </Text>
            <Text style={styles.heroTagline}>We time kitchen cooking to your walking ETA.</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search momos, rolls, biryani, chaat..."
              placeholderTextColor="#9a8880"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Categories Carousel */}
          <View style={styles.categoriesSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    searchQuery.toLowerCase() === cat.name.toLowerCase() && styles.categoryCardActive,
                  ]}
                  onPress={() => setSearchQuery(cat.id === 'all' ? '' : cat.name.split(' ')[0])}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            <TouchableOpacity
              style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>
                All Stalls
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, selectedFilter === 'under100' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('under100')}
            >
              <Text style={[styles.filterChipText, selectedFilter === 'under100' && styles.filterChipTextActive]}>
                ⚡ Under ₹100
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, selectedFilter === 'topRated' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('topRated')}
            >
              <Text style={[styles.filterChipText, selectedFilter === 'topRated' && styles.filterChipTextActive]}>
                ⭐ Top Rated 4.8+
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, selectedFilter === 'veg' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('veg')}
            >
              <Text style={[styles.filterChipText, selectedFilter === 'veg' && styles.filterChipTextActive]}>
                🥬 Pure Veg
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* The Lane Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>The Lane · Closest First</Text>
              <Text style={styles.sectionSubtitle}>WALKING TIME & LIVE KITCHENS</Text>
            </View>
            <View style={styles.openCountBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.openCountText}>{filteredOutlets.length} Open</Text>
            </View>
          </View>

          {/* Outlets List */}
          <View style={styles.outletsList}>
            {loading ? (
              <ActivityIndicator size="large" color="#E13328" style={{ marginTop: 30 }} />
            ) : filteredOutlets.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>No stalls matching "{searchQuery}"</Text>
                <Text style={styles.emptySubtitle}>Try searching for another dish or clear filters.</Text>
              </View>
            ) : (
              filteredOutlets.map((outlet, index) => {
                const stallImg =
                  outlet.image ||
                  (index % 2 === 0
                    ? 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80'
                    : 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80');

                return (
                  <TouchableOpacity
                    key={outlet.id}
                    style={styles.stallCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('OutletMenu', { outletId: outlet.id, outletName: outlet.name })}
                  >
                    <Image source={{ uri: stallImg }} style={styles.stallImage} />

                    <View style={styles.imageWalkBadge}>
                      <Text style={styles.imageWalkText}>
                        🚶 {outlet.deliveryTime || `${(index + 1) * 2} min walk`}
                      </Text>
                    </View>

                    <View style={styles.stallBody}>
                      <View style={styles.stallHeaderRow}>
                        <Text style={styles.stallName}>{outlet.name}</Text>
                        <View style={styles.ratingPill}>
                          <Text style={styles.ratingPillText}>★ {outlet.rating || '4.8'}</Text>
                        </View>
                      </View>

                      <Text style={styles.stallCuisine}>{outlet.cuisine || 'Street Food · Quick Bites'}</Text>
                      <Text style={styles.stallZone}>📍 {outlet.cityZone || 'Campus Court'}</Text>

                      {outlet.usp && (
                        <View style={styles.uspBox}>
                          <Text style={styles.uspText}>🔥 {outlet.usp}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CUSTOMER ORDER HISTORY & TICKETS                                  */}
      {/* ========================================================================= */}
      {activeBottomTab === 'ORDERS' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersHeaderTitle}>My Orders & Pickup Tickets</Text>
            <Text style={styles.ordersHeaderSubtitle}>Track live orders and view past receipts</Text>
          </View>

          {/* Active Live Orders Section */}
          {activeOrder && (
            <View style={styles.historySection}>
              <Text style={styles.historySectionTitle}>🔥 LIVE ACTIVE TICKET</Text>
              <View style={styles.activeOrderCard}>
                <View style={styles.activeOrderTop}>
                  <View>
                    <Text style={styles.activeStallName}>{activeOrder.outlet?.name || 'Stall'}</Text>
                    <Text style={styles.activeOrderEta}>ETA: ~{activeOrder.declaredEtaMinutes || 10} min walk</Text>
                  </View>
                  <View style={styles.activeTokenPill}>
                    <Text style={styles.activeTokenText}>
                      {activeOrder.pickupToken || `#WW-${(activeOrder.id || '4821').substring(0, 4).toUpperCase()}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.activeItemsList}>
                  {(activeOrder.items || []).map((i: any, idx: number) => (
                    <Text key={idx} style={styles.activeItemLine}>
                      {i.quantity}x {i.menuItem?.name || i.name || 'Dish'}
                    </Text>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.trackLiveBtn}
                  onPress={() => navigation.navigate('OrderTrack', { orderId: activeOrder.id })}
                >
                  <Text style={styles.trackLiveBtnText}>View Live Pickup Stepper & Token ➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Past Orders History List */}
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>📋 PAST PICKUPS ({orderHistory.length})</Text>

            {orderHistory.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>🎟️</Text>
                <Text style={styles.emptyTitle}>No past orders yet</Text>
                <Text style={styles.emptySubtitle}>Place an order from any food stall to view history here.</Text>
                <TouchableOpacity
                  style={[styles.trackLiveBtn, { marginTop: 14, backgroundColor: '#E13328' }]}
                  onPress={() => setActiveBottomTab('HOME')}
                >
                  <Text style={styles.trackLiveBtnText}>Browse The Lane ➔</Text>
                </TouchableOpacity>
              </View>
            ) : (
              orderHistory.map((ord: any) => {
                const isCompleted = ord.status === 'COLLECTED';
                const isReady = ord.status === 'READY';

                return (
                  <View key={ord.id} style={styles.pastOrderCard}>
                    <View style={styles.pastOrderHeader}>
                      <View>
                        <Text style={styles.pastStallName}>{ord.outlet?.name || 'Food Stall'}</Text>
                        <Text style={styles.pastDate}>
                          {new Date(ord.createdAt || Date.now()).toLocaleDateString()} · {ord.outlet?.cityZone || 'Campus Court'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadgeSmall,
                          { backgroundColor: isCompleted ? '#d1fae5' : isReady ? '#fff3e0' : '#ffe9e8' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeSmallText,
                            { color: isCompleted ? '#065f46' : isReady ? '#e65100' : '#E13328' },
                          ]}
                        >
                          {ord.status}
                        </Text>
                      </View>
                    </View>

                    {/* Token & Items */}
                    <View style={styles.pastOrderBody}>
                      <View style={styles.tokenRow}>
                        <Text style={styles.tokenLabelText}>PICKUP TOKEN:</Text>
                        <Text style={styles.tokenValText}>
                          {ord.pickupToken || `#WW-${(ord.id || '4821').substring(0, 4).toUpperCase()}`}
                        </Text>
                      </View>

                      {(ord.items || []).map((i: any, idx: number) => (
                        <View key={idx} style={styles.pastItemRow}>
                          <Text style={styles.pastItemQty}>{i.quantity}x</Text>
                          <Text style={styles.pastItemName}>{i.menuItem?.name || i.name || 'Dish'}</Text>
                          <Text style={styles.pastItemPrice}>
                            ₹{parseFloat(i.unitPrice || '0') * i.quantity}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.pastDivider} />

                    <View style={styles.pastFooter}>
                      <Text style={styles.pastTotal}>Total: ₹{ord.totalAmount}</Text>
                      <TouchableOpacity
                        style={styles.reorderBtn}
                        onPress={() => navigation.navigate('OrderTrack', { orderId: ord.id })}
                      >
                        <Text style={styles.reorderBtnText}>View Ticket</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: RADAR SCAN SCREEN                                                 */}
      {/* ========================================================================= */}
      {activeBottomTab === 'SCAN' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersHeaderTitle}>Nearby Walking Radar</Text>
            <Text style={styles.ordersHeaderSubtitle}>Stalls you can physically reach on foot in under 5 mins</Text>
          </View>

          <View style={styles.radarCard}>
            <View style={styles.radarPulse}>
              <Text style={{ fontSize: 28 }}>📍</Text>
            </View>
            <Text style={styles.radarCenterText}>You are at North Campus Plaza</Text>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            {outlets.map((o, idx) => (
              <TouchableOpacity
                key={o.id}
                style={styles.radarListItem}
                onPress={() => navigation.navigate('OutletMenu', { outletId: o.id, outletName: o.name })}
              >
                <View>
                  <Text style={styles.radarStallName}>{o.name}</Text>
                  <Text style={styles.radarStallDist}>🚶 {(idx + 1) * 2} min walk · {o.cityZone || 'Food Court'}</Text>
                </View>
                <Text style={styles.radarOpenMenu}>Open Menu ➔</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: FLAVOR FEED                                                       */}
      {/* ========================================================================= */}
      {activeBottomTab === 'FEED' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersHeaderTitle}>Flavor Feed & Daily Drops</Text>
            <Text style={styles.ordersHeaderSubtitle}>Today's hot local specials & trending student picks</Text>
          </View>

          <View style={styles.feedCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80' }}
              style={styles.feedImg}
            />
            <View style={styles.feedContent}>
              <View style={styles.feedTag}>
                <Text style={styles.feedTagText}>TODAY'S SPECIAL</Text>
              </View>
              <Text style={styles.feedTitle}>Fiery Steamed Chicken Momos</Text>
              <Text style={styles.feedDesc}>
                Fresh batch steaming now at Momo House · 6 pcs with special garlic red chutney · ₹99 pickup deal.
              </Text>
              <TouchableOpacity
                style={styles.feedBtn}
                onPress={() => {
                  if (outlets[0]) {
                    navigation.navigate('OutletMenu', { outletId: outlets[0].id, outletName: outlets[0].name });
                  }
                }}
              >
                <Text style={styles.feedBtnText}>Order for Pickup ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Floating Active Order Widget (when on Discover tab) */}
      {activeOrder && activeBottomTab === 'HOME' && (
        <TouchableOpacity
          style={styles.activeOrderPill}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('OrderTrack', { orderId: activeOrder.id })}
        >
          <View style={styles.activeOrderLeft}>
            <View style={styles.pulseDot} />
            <View>
              <Text style={styles.activeOrderTitle}>
                {activeOrder.status === 'READY' ? '🛎️ Food is READY!' : '🔥 Cooking in Progress...'}
              </Text>
              <Text style={styles.activeOrderSub}>
                {activeOrder.outlet?.name || 'Stall'} · Token {activeOrder.pickupToken || '#WW-4821'}
              </Text>
            </View>
          </View>
          <View style={styles.activeOrderRight}>
            <Text style={styles.viewTicketText}>View Ticket ➔</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom Nav with Connected Tabs & Badges */}
      <BottomNav
        activeTab={activeBottomTab}
        onSelectTab={setActiveBottomTab}
        orderCount={orderHistory.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd2',
  },
  locationContainer: {
    flex: 1,
  },
  locIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locPin: {
    fontSize: 14,
    marginRight: 4,
  },
  locTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2B1710',
  },
  locArrow: {
    fontSize: 11,
    marginLeft: 4,
    color: '#E13328',
    fontWeight: '900',
  },
  locSubtitle: {
    fontSize: 10,
    color: '#806c61',
    fontWeight: '600',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeRoleBtn: {
    backgroundColor: '#f5eee6',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
  },
  changeRoleBtnText: {
    color: '#2B1710',
    fontSize: 10,
    fontWeight: '800',
  },
  switchRolePill: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#FFC22E',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
  },
  switchRoleText: {
    color: '#e65100',
    fontSize: 10,
    fontWeight: '800',
  },
  logoutPill: {
    backgroundColor: '#ffe9e8',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },
  logoutPillText: {
    color: '#E13328',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#E13328',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#E13328',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  heroBadge: {
    backgroundColor: '#2B1710',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#FFC22E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  heroHighlight: {
    color: '#FFC22E',
  },
  heroTagline: {
    color: '#ffe0dc',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
  },
  searchIcon: {
    fontSize: 16,
    color: '#806c61',
    marginRight: 8,
    fontWeight: '900',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2B1710',
    fontWeight: '700',
  },
  clearIcon: {
    fontSize: 13,
    color: '#806c61',
    fontWeight: '900',
    padding: 4,
  },
  categoriesSection: {
    marginTop: 12,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eadfd2',
    minWidth: 64,
  },
  categoryCardActive: {
    borderColor: '#E13328',
    backgroundColor: '#fff5f4',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 3,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2B1710',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eadfd2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipActive: {
    backgroundColor: '#2B1710',
    borderColor: '#2B1710',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#806c61',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2B1710',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#806c61',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  openCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2e7d32',
    marginRight: 4,
  },
  openCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2e7d32',
  },
  outletsList: {
    paddingHorizontal: 16,
  },
  stallCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stallImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#f5eee6',
  },
  imageWalkBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#2B1710e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageWalkText: {
    color: '#FFC22E',
    fontSize: 10,
    fontWeight: '900',
  },
  stallBody: {
    padding: 12,
  },
  stallHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stallName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2B1710',
    flex: 1,
  },
  ratingPill: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  ratingPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  stallCuisine: {
    fontSize: 12,
    fontWeight: '600',
    color: '#806c61',
    marginTop: 3,
  },
  stallZone: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9e8c80',
    marginTop: 1,
  },
  uspBox: {
    backgroundColor: '#FFFBF2',
    borderWidth: 1,
    borderColor: '#eadfd2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 8,
  },
  uspText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E13328',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eadfd2',
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2B1710',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#806c61',
    marginTop: 3,
    textAlign: 'center',
  },
  activeOrderPill: {
    position: 'absolute',
    bottom: 68,
    left: 16,
    right: 16,
    backgroundColor: '#2B1710',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  activeOrderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  activeOrderTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  activeOrderSub: {
    color: '#FFC22E',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  activeOrderRight: {},
  viewTicketText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: '#E13328',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ordersHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd2',
    marginBottom: 14,
  },
  ordersHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2B1710',
  },
  ordersHeaderSubtitle: {
    fontSize: 12,
    color: '#806c61',
    fontWeight: '600',
    marginTop: 2,
  },
  historySection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  historySectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#806c61',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  activeOrderCard: {
    backgroundColor: '#2B1710',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  activeOrderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activeStallName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  activeOrderEta: {
    fontSize: 12,
    color: '#FFC22E',
    fontWeight: '800',
    marginTop: 2,
  },
  activeTokenPill: {
    backgroundColor: '#FFC22E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeTokenText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2B1710',
  },
  activeItemsList: {
    backgroundColor: '#3b251d',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  activeItemLine: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f5eee6',
    marginBottom: 2,
  },
  trackLiveBtn: {
    backgroundColor: '#E13328',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  trackLiveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  pastOrderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pastOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pastStallName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1710',
  },
  pastDate: {
    fontSize: 11,
    color: '#806c61',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeSmallText: {
    fontSize: 10,
    fontWeight: '900',
  },
  pastOrderBody: {
    backgroundColor: '#FFFBF2',
    borderRadius: 10,
    padding: 10,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd2',
    paddingBottom: 4,
  },
  tokenLabelText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#806c61',
  },
  tokenValText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E13328',
  },
  pastItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pastItemQty: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E13328',
    width: 22,
  },
  pastItemName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#2B1710',
  },
  pastItemPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B1710',
  },
  pastDivider: {
    height: 1,
    backgroundColor: '#eadfd2',
    marginVertical: 10,
  },
  pastFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2B1710',
  },
  reorderBtn: {
    backgroundColor: '#f5eee6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  reorderBtnText: {
    color: '#2B1710',
    fontSize: 11,
    fontWeight: '800',
  },
  radarCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#eadfd2',
  },
  radarPulse: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  radarCenterText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2B1710',
  },
  radarListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eadfd2',
  },
  radarStallName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2B1710',
  },
  radarStallDist: {
    fontSize: 12,
    color: '#806c61',
    fontWeight: '600',
    marginTop: 2,
  },
  radarOpenMenu: {
    color: '#E13328',
    fontSize: 12,
    fontWeight: '900',
  },
  feedCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
  },
  feedImg: {
    width: '100%',
    height: 180,
  },
  feedContent: {
    padding: 16,
  },
  feedTag: {
    backgroundColor: '#FFC22E',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  feedTagText: {
    color: '#2B1710',
    fontSize: 9,
    fontWeight: '900',
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2B1710',
    marginBottom: 4,
  },
  feedDesc: {
    fontSize: 12,
    color: '#806c61',
    lineHeight: 18,
    marginBottom: 12,
  },
  feedBtn: {
    backgroundColor: '#E13328',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  feedBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
});
