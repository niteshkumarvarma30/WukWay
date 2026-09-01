import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RoleSelectionScreenProps = {
  onSelectRole: (role: 'CUSTOMER' | 'VENDOR') => void;
};

export default function RoleSelectionScreen({ onSelectRole }: RoleSelectionScreenProps) {
  const { isSignedIn, signOut } = useAuth();

  const handleSelect = async (role: 'CUSTOMER' | 'VENDOR' | 'ADMIN') => {
    if (role === 'ADMIN') {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const adminUrl = window.location.hostname.includes('vercel.app')
          ? 'https://wuk-way.vercel.app/admin'
          : 'http://localhost:5173/admin';
        window.location.href = adminUrl;
      } else {
        alert('Admin portal is available at https://wuk-way.vercel.app/admin');
      }
      return;
    }


    await AsyncStorage.setItem('appRole', role);
    onSelectRole(role);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>WukWay</Text>
          <Text style={styles.tagline}>Order ahead. Skip the queue. Collect when ready.</Text>
        </View>

        <Text style={styles.questionTitle}>Select your Portal</Text>
        <Text style={styles.questionSubtitle}>Choose how you want to use WukWay today:</Text>

        {/* 1. Customer Card */}
        <TouchableOpacity
          style={styles.roleCard}
          activeOpacity={0.88}
          onPress={() => handleSelect('CUSTOMER')}
        >
          <View style={styles.iconCircleCustomer}>
            <Text style={styles.iconText}>🍔</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>Customer</Text>
              <Text style={styles.arrowIcon}>➔</Text>
            </View>
            <Text style={styles.cardSubtitle}>Browse campus stalls, order with ETA, and skip the waiting line.</Text>
          </View>
        </TouchableOpacity>

        {/* 2. Vendor Card */}
        <TouchableOpacity
          style={styles.roleCard}
          activeOpacity={0.88}
          onPress={() => handleSelect('VENDOR')}
        >
          <View style={styles.iconCircleVendor}>
            <Text style={styles.iconText}>🏪</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>Food Stall / Vendor</Text>
              <Text style={styles.arrowIcon}>➔</Text>
            </View>
            <Text style={styles.cardSubtitle}>Kitchen Display System (KDS), manage incoming tickets and tokens.</Text>
          </View>
        </TouchableOpacity>

        {/* 3. Admin Card */}
        <TouchableOpacity
          style={[styles.roleCard, styles.adminCard]}
          activeOpacity={0.88}
          onPress={() => handleSelect('ADMIN')}
        >
          <View style={styles.iconCircleAdmin}>
            <Text style={styles.iconText}>💻</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>Admin Operations</Text>
              <Text style={styles.arrowIcon}>➔</Text>
            </View>
            <Text style={styles.cardSubtitle}>Platform command center, stall approvals, menus & GMV analytics.</Text>
          </View>
        </TouchableOpacity>

        {isSignedIn && (
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => {
              AsyncStorage.clear();
              signOut();
            }}
          >
            <Text style={styles.signOutText}>Sign Out Current Account</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFBF2',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.8,
    color: '#E13328',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: '#2B1710',
    fontWeight: '600',
    lineHeight: 22,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2B1710',
    letterSpacing: -0.5,
  },
  questionSubtitle: {
    fontSize: 13,
    color: '#806c61',
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 20,
  },
  roleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  adminCard: {
    backgroundColor: '#fffdf8',
    borderColor: '#e2d5c8',
  },
  iconCircleCustomer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconCircleVendor: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffe9e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconCircleAdmin: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5eee6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 26,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2B1710',
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E13328',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#806c61',
    lineHeight: 16,
    fontWeight: '500',
  },
  signOutBtn: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  signOutText: {
    color: '#E13328',
    fontSize: 12,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
