import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { RootStackParamList } from '../../navigation/AppNavigator';
import api from '../../services/api';

type OutletMenuRouteProp = RouteProp<RootStackParamList, 'OutletMenu'>;
type OutletMenuNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OutletMenu'>;

type Props = {
  route: OutletMenuRouteProp;
  navigation: OutletMenuNavigationProp;
};

export default function OutletMenuScreen({ route, navigation }: Props) {
  const { outletId, outletName } = route.params;
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter tabs
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Cart state: mapping of menuItemId to quantity
  const [cart, setCart] = useState<Record<string, number>>({});
  const [ordering, setOrdering] = useState(false);

  // ETA Modal state
  const [etaModalVisible, setEtaModalVisible] = useState(false);
  const [selectedEta, setSelectedEta] = useState<number>(10);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`/outlets/${outletId}/menu`);
        setMenu(res.data || []);
      } catch (error) {
        console.error('Error fetching menu', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [outletId]);

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const newCart = { ...prev };
        delete newCart[id];
        return newCart;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const getTotalPrice = () => {
    let total = 0;
    menu.forEach((item) => {
      if (cart[item.id]) {
        total += parseFloat(item.price) * cart[item.id];
      }
    });
    return total;
  };

  const getCartItemsList = () => {
    const items: any[] = [];
    menu.forEach((item) => {
      if (cart[item.id]) {
        items.push({
          menuItemId: item.id,
          name: item.name,
          quantity: cart[item.id],
          unitPrice: parseFloat(item.price),
        });
      }
    });
    return items;
  };

  const handlePlaceOrder = async () => {
    setOrdering(true);
    try {
      let dbUserId = 'demo-cust-id';
      try {
        const token = await getToken();
        if (token) {
          const syncRes = await api.post(
            '/users/sync',
            { role: 'CUSTOMER', email: clerkUser?.primaryEmailAddress?.emailAddress || 'customer@wukway.com' },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          dbUserId = syncRes.data.id;
        }
      } catch (authErr) {
        console.warn('Using guest auth fallback');
      }

      const orderPayload = {
        customerId: dbUserId,
        outletId: outletId,
        outletName: outletName,
        customerName: clerkUser?.fullName || 'WukWay Customer',
        totalAmount: getTotalPrice(),
        declaredEtaMinutes: selectedEta,
        items: getCartItemsList(),
      };

      const res = await api.post('/orders', orderPayload);
      setEtaModalVisible(false);
      // Navigate to live ticket tracking screen
      navigation.navigate('OrderTrack', { orderId: res.data.id });
    } catch (e) {
      console.error(e);
      alert('Could not place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Filter menu
  const categories = ['ALL', ...Array.from(new Set(menu.map((i) => i.category || 'Special')))];
  const filteredMenu =
    activeCategory === 'ALL' ? menu : menu.filter((i) => (i.category || 'Special') === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {outletName}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stall Banner Info */}
        <View style={styles.bannerCard}>
          <Text style={styles.stallTitle}>{outletName}</Text>
          <Text style={styles.stallMeta}>Street Food & Quick Bites · Walking pickup only</Text>
          <View style={styles.badgesRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ 4.8</Text>
            </View>
            <View style={styles.walkBadge}>
              <Text style={styles.walkText}>🚶 2-4 min walk</Text>
            </View>
            <View style={styles.freshBadge}>
              <Text style={styles.freshText}>🔥 Cooked upon arrival</Text>
            </View>
          </View>
        </View>

        {/* Quick Choice Suggestion Pills (Swiggy style) */}
        <View style={styles.quickChoices}>
          <Text style={styles.quickTitle}>Quick Choices</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                  {cat === 'ALL' ? '🍽️ All Menu' : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#E13328" style={{ marginTop: 40 }} />
          ) : filteredMenu.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items found in this section.</Text>
            </View>
          ) : (
            filteredMenu.map((item) => {
              const qty = cart[item.id] || 0;
              const isVeg = item.isVeg ?? (item.name.toLowerCase().includes('paneer') || item.name.toLowerCase().includes('puri') || item.name.toLowerCase().includes('veg'));
              const itemImg =
                item.image ||
                (isVeg
                  ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'
                  : 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=300&q=80');

              return (
                <View key={item.id} style={styles.menuItemCard}>
                  <View style={styles.itemDetails}>
                    {/* Veg/Non-Veg Square Icon */}
                    <View style={styles.vegIndicatorRow}>
                      <View style={[styles.vegSquare, { borderColor: isVeg ? '#2e7d32' : '#c62828' }]}>
                        <View style={[styles.vegCircle, { backgroundColor: isVeg ? '#2e7d32' : '#c62828' }]} />
                      </View>
                      {item.tag && (
                        <View style={styles.itemTag}>
                          <Text style={styles.itemTagText}>{item.tag}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                    {item.description && (
                      <Text style={styles.itemDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </View>

                  {/* Right Image + Action Button */}
                  <View style={styles.imageActionWrapper}>
                    <Image source={{ uri: itemImg }} style={styles.itemImage} />
                    <View style={styles.buttonPositioner}>
                      {qty > 0 ? (
                        <View style={styles.qtyCounter}>
                          <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.qtyBtn}>
                            <Text style={styles.qtyBtnText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyNumber}>{qty}</Text>
                          <TouchableOpacity onPress={() => addToCart(item.id)} style={styles.qtyBtn}>
                            <Text style={styles.qtyBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity onPress={() => addToCart(item.id)} style={styles.addBtn}>
                          <Text style={styles.addBtnText}>ADD +</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <View style={styles.cartBarWrapper}>
          <View style={styles.cartBar}>
            <View>
              <Text style={styles.cartBarCount}>
                {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'} ADDED
              </Text>
              <Text style={styles.cartBarTotal}>₹{getTotalPrice()}</Text>
            </View>
            <TouchableOpacity style={styles.reviewTicketBtn} onPress={() => setEtaModalVisible(true)}>
              <Text style={styles.reviewTicketText}>Select ETA & Place ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ETA Selection Bottom Sheet Modal */}
      <Modal visible={etaModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>TIMED COOKING</Text>
                <Text style={styles.modalTitle}>When will you reach?</Text>
              </View>
              <TouchableOpacity onPress={() => setEtaModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              We tell the kitchen to start cooking so your food is fresh and hot the second you arrive.
            </Text>

            {/* ETA Options Grid */}
            <View style={styles.etaGrid}>
              <TouchableOpacity
                style={[styles.etaOption, selectedEta === 5 && styles.etaOptionSelected]}
                onPress={() => setSelectedEta(5)}
              >
                <Text style={[styles.etaTime, selectedEta === 5 && styles.etaTextSelected]}>~5</Text>
                <Text style={[styles.etaUnit, selectedEta === 5 && styles.etaTextSelected]}>MINUTES</Text>
                <Text style={styles.etaDesc}>Almost there</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.etaOption, selectedEta === 10 && styles.etaOptionSelected]}
                onPress={() => setSelectedEta(10)}
              >
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>BEST</Text>
                </View>
                <Text style={[styles.etaTime, selectedEta === 10 && styles.etaTextSelected]}>~10</Text>
                <Text style={[styles.etaUnit, selectedEta === 10 && styles.etaTextSelected]}>MINUTES</Text>
                <Text style={styles.etaDesc}>Normal walk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.etaOption, selectedEta === 15 && styles.etaOptionSelected]}
                onPress={() => setSelectedEta(15)}
              >
                <Text style={[styles.etaTime, selectedEta === 15 && styles.etaTextSelected]}>~15</Text>
                <Text style={[styles.etaUnit, selectedEta === 15 && styles.etaTextSelected]}>MINUTES</Text>
                <Text style={styles.etaDesc}>From dorm</Text>
              </TouchableOpacity>
            </View>

            {/* Ticket Breakdown */}
            <View style={styles.ticketSummaryBox}>
              <View style={styles.ticketSummaryRow}>
                <Text style={styles.ticketSummaryLabel}>Stall</Text>
                <Text style={styles.ticketSummaryValue}>{outletName}</Text>
              </View>
              <View style={styles.ticketSummaryRow}>
                <Text style={styles.ticketSummaryLabel}>Items</Text>
                <Text style={styles.ticketSummaryValue}>{totalItems} items</Text>
              </View>
              <View style={styles.ticketSummaryRow}>
                <Text style={styles.ticketSummaryLabel}>Total to Pay (UPI)</Text>
                <Text style={styles.ticketSummaryTotal}>₹{getTotalPrice()}</Text>
              </View>
            </View>

            {/* Confirm Place Order Button */}
            <TouchableOpacity
              style={[styles.confirmOrderBtn, ordering && { opacity: 0.7 }]}
              onPress={handlePlaceOrder}
              disabled={ordering}
            >
              {ordering ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmOrderText}>Confirm & Pay ₹{getTotalPrice()}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd2',
    backgroundColor: '#fff',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5eee6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2B1710',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2B1710',
    maxWidth: '70%',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  bannerCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd2',
  },
  stallTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2B1710',
    letterSpacing: -0.5,
  },
  stallMeta: {
    fontSize: 13,
    color: '#806c61',
    fontWeight: '600',
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  ratingBadge: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  walkBadge: {
    backgroundColor: '#ffe9e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  walkText: {
    color: '#E13328',
    fontSize: 11,
    fontWeight: '800',
  },
  freshBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freshText: {
    color: '#e65100',
    fontSize: 11,
    fontWeight: '800',
  },
  quickChoices: {
    marginTop: 16,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#806c61',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eadfd2',
  },
  catChipActive: {
    backgroundColor: '#2B1710',
    borderColor: '#2B1710',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#806c61',
  },
  catChipTextActive: {
    color: '#fff',
  },
  menuSection: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#806c61',
    fontSize: 15,
    fontWeight: '700',
  },
  menuItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eadfd2',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  itemDetails: {
    flex: 1,
    paddingRight: 12,
  },
  vegIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  vegSquare: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemTag: {
    backgroundColor: '#FFC22E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2B1710',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2B1710',
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2B1710',
    marginTop: 4,
  },
  itemDesc: {
    fontSize: 12,
    color: '#806c61',
    lineHeight: 16,
    marginTop: 4,
  },
  imageActionWrapper: {
    width: 96,
    alignItems: 'center',
  },
  itemImage: {
    width: 96,
    height: 86,
    borderRadius: 12,
    backgroundColor: '#f5eee6',
  },
  buttonPositioner: {
    marginTop: -14,
  },
  addBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E13328',
    shadowColor: '#E13328',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    color: '#E13328',
    fontSize: 12,
    fontWeight: '900',
  },
  qtyCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E13328',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  qtyBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  qtyBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  qtyNumber: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
    paddingHorizontal: 4,
  },
  cartBarWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  cartBar: {
    backgroundColor: '#2B1710',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  cartBarCount: {
    color: '#FFC22E',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cartBarTotal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  reviewTicketBtn: {
    backgroundColor: '#E13328',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  reviewTicketText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFBF2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    color: '#E13328',
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2B1710',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eadfd2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2B1710',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#806c61',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 20,
    fontWeight: '500',
  },
  etaGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  etaOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#eadfd2',
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  etaOptionSelected: {
    borderColor: '#E13328',
    backgroundColor: '#fff5f4',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -9,
    backgroundColor: '#FFC22E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#2B1710',
  },
  etaTime: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2B1710',
  },
  etaUnit: {
    fontSize: 9,
    fontWeight: '900',
    color: '#806c61',
    marginTop: 2,
  },
  etaDesc: {
    fontSize: 10,
    fontWeight: '700',
    color: '#806c61',
    marginTop: 4,
  },
  etaTextSelected: {
    color: '#E13328',
  },
  ticketSummaryBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eadfd2',
    marginBottom: 20,
  },
  ticketSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ticketSummaryLabel: {
    fontSize: 13,
    color: '#806c61',
    fontWeight: '600',
  },
  ticketSummaryValue: {
    fontSize: 13,
    color: '#2B1710',
    fontWeight: '800',
  },
  ticketSummaryTotal: {
    fontSize: 16,
    color: '#E13328',
    fontWeight: '900',
  },
  confirmOrderBtn: {
    backgroundColor: '#E13328',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});
