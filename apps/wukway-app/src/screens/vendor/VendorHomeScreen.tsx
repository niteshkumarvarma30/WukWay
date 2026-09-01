import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Switch,
  Platform,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import VendorHeader from '../../components/vendor/VendorHeader';
import OrderCard from '../../components/vendor/OrderCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function VendorHomeScreen() {
  const { signOut, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [dbUserId, setDbUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [outlet, setOutlet] = useState<any>(null);

  // Registration Form State
  const [stallName, setStallName] = useState('');
  const [stallZone, setStallZone] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'COOKING' | 'READY' | 'COMPLETED'>('COOKING');
  const [orders, setOrders] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const fetchVendorData = async (targetId: string, currentOutletId?: string) => {
    try {
      // 1. Fetch Outlet
      const outletRes = await api.get(`/outlets/vendor/${targetId}`);
      if (outletRes.data && outletRes.data.id) {
        setOutlet(outletRes.data);
        setIsOpen(outletRes.data.status === 'OPEN');

        // 2. Fetch Orders for this outlet/vendor
        if (outletRes.data.isApproved) {
          const fetchId = outletRes.data.id || targetId;
          const ordersRes = await api.get(`/orders/vendor/${fetchId}`);
          const mappedOrders = (ordersRes.data || []).map((o: any) => ({
            id: o.id,
            orderId: (o.id || '4821').substring(0, 5).toUpperCase(),
            customerName: o.customer?.name || 'Customer',
            eta: `${o.declaredEtaMinutes || 10} min`,
            status: o.status,
            pickupToken: o.pickupToken || `#WW-${(o.id || '4821').substring(0, 4).toUpperCase()}`,
            items: (o.items || []).map((i: any) => ({
              qty: i.quantity,
              name: i.menuItem?.name || i.name || 'Dish',
            })),
          }));
          setOrders(mappedOrders);
        }
      } else {
        // Check if user selected demo stall
        const demoStallId = await AsyncStorage.getItem('activeVendorStallId');
        if (demoStallId) {
          const allOutlets = await api.get('/outlets');
          const found = (allOutlets.data || []).find((o: any) => o.id === demoStallId);
          if (found) {
            setOutlet(found);
            setIsOpen(found.status === 'OPEN');
            const ordersRes = await api.get(`/orders/vendor/${found.id}`);
            const mappedOrders = (ordersRes.data || []).map((o: any) => ({
              id: o.id,
              orderId: (o.id || '4821').substring(0, 5).toUpperCase(),
              customerName: o.customer?.name || 'Customer',
              eta: `${o.declaredEtaMinutes || 10} min`,
              status: o.status,
              pickupToken: o.pickupToken || `#WW-${(o.id || '4821').substring(0, 4).toUpperCase()}`,
              items: (o.items || []).map((i: any) => ({
                qty: i.quantity,
                name: i.menuItem?.name || i.name || 'Dish',
              })),
            }));
            setOrders(mappedOrders);
            return;
          }
        }
        setOutlet(null);
      }
    } catch (e) {
      console.error('Fetch vendor error', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        let userId = 'vendor_' + (clerkUser?.id ? clerkUser.id.substring(0, 8) : 'demo');
        try {
          const token = await getToken();
          if (token) {
            const syncRes = await api.post(
              '/users/sync',
              { role: 'VENDOR', email: clerkUser?.primaryEmailAddress?.emailAddress },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (syncRes.data?.id) userId = syncRes.data.id;
          }
        } catch (e) {
          console.warn('Vendor sync fallback');
        }

        setDbUserId(userId);
        await fetchVendorData(userId);
      } catch (e) {
        console.error('Init error', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [clerkUser]);

  // Real-time polling
  useEffect(() => {
    if (!dbUserId) return;
    const interval = setInterval(() => {
      fetchVendorData(dbUserId, outlet?.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [dbUserId, outlet?.id]);

  const handleRegister = async () => {
    if (!stallName || !stallZone) {
      alert('Please enter both Stall Name and Campus Location.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/outlets', {
        name: stallName,
        cityZone: stallZone,
        cuisine: cuisine || 'Quick Bites & Street Food',
        ownerId: dbUserId,
        ownerName: clerkUser?.fullName || 'Vendor Partner',
        isApproved: false, // Must be approved by Admin in Admin Portal!
        status: 'CLOSED',
      });
      setOutlet(res.data);
      await AsyncStorage.removeItem('activeVendorStallId');
    } catch (e) {
      console.warn('Backend offline, using client fallback for stall registration');
      const fallbackOutlet = {
        id: `out-${Date.now()}`,
        name: stallName,
        cityZone: stallZone,
        cuisine: cuisine || 'Quick Bites & Street Food',
        ownerId: dbUserId || 'vendor_demo',
        isApproved: false,
        status: 'CLOSED',
        menuItems: [],
      };
      setOutlet(fallbackOutlet);
      await AsyncStorage.setItem('pendingCustomStall', JSON.stringify(fallbackOutlet));
    } finally {
      setSubmitting(false);
    }
  };


  const handleLaunchDemoStall = async (stallId: string) => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('activeVendorStallId', stallId);
      const allOutlets = await api.get('/outlets');
      const found = (allOutlets.data || []).find((o: any) => o.id === stallId);
      if (found) {
        setOutlet(found);
        setIsOpen(found.status === 'OPEN');
        const ordersRes = await api.get(`/orders/vendor/${found.id}`);
        const mappedOrders = (ordersRes.data || []).map((o: any) => ({
          id: o.id,
          orderId: (o.id || '4821').substring(0, 5).toUpperCase(),
          customerName: o.customer?.name || 'Customer',
          eta: `${o.declaredEtaMinutes || 10} min`,
          status: o.status,
          pickupToken: o.pickupToken || `#WW-${(o.id || '4821').substring(0, 4).toUpperCase()}`,
          items: (o.items || []).map((i: any) => ({
            qty: i.quantity,
            name: i.menuItem?.name || i.name || 'Dish',
          })),
        }));
        setOrders(mappedOrders);
      }
    } catch (e) {
      console.warn('Launch demo stall error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpen = async (value: boolean) => {
    setIsOpen(value);
    if (!outlet) return;
    try {
      await api.patch(`/outlets/${outlet.id}/status`, { status: value ? 'OPEN' : 'CLOSED' });
    } catch (e) {
      console.error('Toggle status error', e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      if (dbUserId) fetchVendorData(dbUserId, outlet?.id);
    } catch (e) {
      console.error('Failed to update status', e);
      alert('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E13328" />
        <Text style={{ marginTop: 10, color: '#806c61', fontWeight: '700' }}>Loading Kitchen Display...</Text>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STATE 1: Vendor hasn't registered a stall yet
  // ==========================================
  if (!outlet) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.centerBox} showsVerticalScrollIndicator={false}>
          {/* Quick Demo Kitchen Shortcut Card */}
          <View style={styles.demoShortcutCard}>
            <View style={styles.demoHeaderRow}>
              <Text style={{ fontSize: 24 }}>⚡</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.demoCardTitle}>Instant Kitchen Display (Demo)</Text>
                <Text style={styles.demoCardSubtitle}>
                  Want to cook and verify the orders you just placed in Customer app?
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.demoLaunchBtn}
              onPress={() => handleLaunchDemoStall('out-1')}
            >
              <Text style={styles.demoLaunchBtnText}>👨‍🍳 Launch Momo House Kitchen Display ➔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR REGISTER A NEW STALL</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>Register a New Food Stall</Text>
            <Text style={styles.subtitle}>
              Fill out the form below. An Admin will approve it from the Operations Hub before your kitchen goes live.
            </Text>

            <Text style={styles.formLabel}>STALL NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Royal Biryani, Chai Point"
              placeholderTextColor="#9a8880"
              value={stallName}
              onChangeText={setStallName}
            />

            <Text style={styles.formLabel}>CAMPUS LOCATION & ZONE *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Science Block Food Court · 2 min walk"
              placeholderTextColor="#9a8880"
              value={stallZone}
              onChangeText={setStallZone}
            />

            <Text style={styles.formLabel}>CUISINE / SPECIALTY</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dum Biryani, Shakes, Quick Bites"
              placeholderTextColor="#9a8880"
              value={cuisine}
              onChangeText={setCuisine}
            />

            <TouchableOpacity
              style={[styles.btn, submitting && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.btnText}>Submit for Admin Approval ➔</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomLinkRow}>
            <TouchableOpacity
              onPress={() => {
                if (typeof window !== 'undefined') window.location.href = '/customer';
              }}
            >
              <Text style={styles.switchLinkText}>🍔 Switch to Customer App</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => signOut()}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STATE 2: Stall Registered & Waiting for Admin Approval
  // ==========================================
  if (!outlet.isApproved) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pendingBox}>
          <View style={styles.pendingBadgeCircle}>
            <Text style={{ fontSize: 44 }}>⏳</Text>
          </View>

          <View style={styles.pendingStatusTag}>
            <Text style={styles.pendingStatusText}>APPLICATION SUBMITTED</Text>
          </View>

          <Text style={styles.pendingTitle}>Pending Admin Approval</Text>
          <Text style={styles.pendingSubtitle}>
            Your food stall <Text style={{ fontWeight: '900', color: '#2B1710' }}>"{outlet.name}"</Text> has been submitted for review.
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Next Steps:</Text>
            <Text style={styles.infoBullet}>1. Platform Admin reviews your stall on the Admin Operations Hub.</Text>
            <Text style={styles.infoBullet}>2. Admin clicks "Approve Stall" to verify and activate your menu.</Text>
            <Text style={styles.infoBullet}>3. This screen auto-refreshes into your Kitchen Display the moment you are approved!</Text>
          </View>

          <TouchableOpacity
            style={styles.adminShortcutBtn}
            onPress={() => {
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                const adminUrl = window.location.hostname.includes('vercel.app')
                  ? 'https://wuk-way.vercel.app/admin'
                  : 'http://localhost:5173/admin';
                window.open(adminUrl, '_blank');
              }
            }}

          >
            <Text style={styles.adminShortcutText}>💻 Open Admin Operations Hub to Approve ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#806c61', marginTop: 14 }]}
            onPress={async () => {
              setOutlet(null);
              await AsyncStorage.removeItem('activeVendorStallId');
            }}
          >
            <Text style={styles.btnText}>← Register Another Stall or Choose Demo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STATE 3: Stall Approved -> Active Kitchen Display System
  // ==========================================
  const cookingOrders = orders.filter((o) => ['PENDING', 'ACCEPTED', 'PREPARING'].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const completedOrders = orders.filter((o) => o.status === 'COLLECTED');

  let displayedOrders = cookingOrders;
  if (activeTab === 'READY') displayedOrders = readyOrders;
  if (activeTab === 'COMPLETED') displayedOrders = completedOrders;

  return (
    <SafeAreaView style={styles.container}>
      <VendorHeader />

      {/* Stall Status & Stats Header */}
      <View style={styles.statusBar}>
        <View>
          <View style={styles.approvedPill}>
            <Text style={styles.approvedPillText}>✓ VERIFIED & APPROVED</Text>
          </View>
          <Text style={styles.stallNameHeading}>{outlet.name}</Text>
          <Text style={styles.stallZoneText}>📍 {outlet.cityZone || 'Campus Court'}</Text>
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: isOpen ? '#2e7d32' : '#c62828' }]}>
            {isOpen ? '● ACCEPTING' : '○ PAUSED'}
          </Text>
          <Switch value={isOpen} onValueChange={handleToggleOpen} trackColor={{ true: '#2e7d32', false: '#eadfd2' }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'COOKING' && styles.activeTab]}
          onPress={() => setActiveTab('COOKING')}
        >
          <Text style={[styles.tabText, activeTab === 'COOKING' && styles.activeTabText]}>
            🔥 Needs Cooking ({cookingOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'READY' && styles.activeTab]}
          onPress={() => setActiveTab('READY')}
        >
          <Text style={[styles.tabText, activeTab === 'READY' && styles.activeTabText]}>
            🛎️ Ready for Pickup ({readyOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'COMPLETED' && styles.activeTab]}
          onPress={() => setActiveTab('COMPLETED')}
        >
          <Text style={[styles.tabText, activeTab === 'COMPLETED' && styles.activeTabText]}>
            ✓ Handed Over ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {displayedOrders.map((order) => (
          <OrderCard key={order.id} {...order} onUpdateStatus={handleUpdateOrderStatus} />
        ))}

        {displayedOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>
              {activeTab === 'COOKING' ? '👨‍🍳' : activeTab === 'READY' ? '✨' : '📋'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'COOKING'
                ? 'All clear! No orders waiting to be cooked.'
                : activeTab === 'READY'
                ? 'No orders waiting for customer pickup.'
                : 'No completed orders yet today.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.switchModeBtn}
          onPress={() => {
            if (typeof window !== 'undefined') window.location.href = '/customer';
          }}
        >
          <Text style={styles.switchModeText}>🍔 Switch to Customer App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeStallBtn}
          onPress={async () => {
            setOutlet(null);
            await AsyncStorage.removeItem('activeVendorStallId');
          }}
        >
          <Text style={styles.changeStallText}>🏪 Switch Stall</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtnFixed} onPress={() => signOut()}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2' },
  centerBox: { padding: 20, alignItems: 'center' },
  demoShortcutCard: {
    width: '100%',
    backgroundColor: '#2B1710',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoCardTitle: {
    color: '#FFC22E',
    fontSize: 16,
    fontWeight: '900',
  },
  demoCardSubtitle: {
    color: '#f5eee6',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  demoLaunchBtn: {
    backgroundColor: '#E13328',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  demoLaunchBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eadfd2',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#806c61',
    marginHorizontal: 12,
    letterSpacing: 0.8,
  },
  title: { fontSize: 20, fontWeight: '900', color: '#2B1710', marginBottom: 6 },
  subtitle: { fontSize: 12, color: '#806c61', marginBottom: 18, lineHeight: 17 },
  formCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    padding: 18,
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#806c61',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 46,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#fffdf8',
    fontSize: 13,
    fontWeight: '700',
    color: '#2B1710',
  },
  btn: {
    width: '100%',
    height: 48,
    backgroundColor: '#E13328',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#E13328',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  btnText: { color: 'white', fontWeight: '900', fontSize: 14 },
  bottomLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  switchLinkText: {
    color: '#E13328',
    fontWeight: '800',
    fontSize: 13,
  },
  logoutText: { color: '#806c61', fontWeight: '800', fontSize: 12 },
  pendingBox: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadgeCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pendingStatusTag: {
    backgroundColor: '#FFC22E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  pendingStatusText: {
    color: '#2B1710',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  pendingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2B1710',
    marginBottom: 8,
    textAlign: 'center',
  },
  pendingSubtitle: {
    fontSize: 14,
    color: '#806c61',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2B1710',
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 12,
    color: '#806c61',
    lineHeight: 18,
    marginBottom: 6,
    fontWeight: '600',
  },
  adminShortcutBtn: {
    backgroundColor: '#2B1710',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  adminShortcutText: {
    color: '#FFC22E',
    fontSize: 12,
    fontWeight: '900',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd2',
  },
  approvedPill: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  approvedPillText: {
    color: '#065f46',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stallNameHeading: { fontSize: 18, fontWeight: '900', color: '#2B1710' },
  stallZoneText: { fontSize: 12, fontWeight: '600', color: '#806c61', marginTop: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 14, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, borderBottomWidth: 2.5, borderBottomColor: '#eadfd2', alignItems: 'center' },
  activeTab: { borderBottomColor: '#E13328' },
  tabText: { fontSize: 12, fontWeight: '800', color: '#806c61' },
  activeTabText: { color: '#E13328' },
  scrollContent: { padding: 16, paddingBottom: 90 },
  emptyState: { alignItems: 'center', marginTop: 50, paddingHorizontal: 30 },
  emptyText: { color: '#806c61', fontSize: 14, fontWeight: '700', textAlign: 'center', lineHeight: 20 },
  bottomActions: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eadfd2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchModeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#ffe9e8',
    borderRadius: 10,
  },
  switchModeText: {
    color: '#E13328',
    fontSize: 11,
    fontWeight: '800',
  },
  changeStallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f5eee6',
    borderRadius: 10,
  },
  changeStallText: {
    color: '#2B1710',
    fontSize: 11,
    fontWeight: '800',
  },
  logoutBtnFixed: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
});
