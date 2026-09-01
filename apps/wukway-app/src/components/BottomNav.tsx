import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type BottomNavProps = {
  activeTab?: 'HOME' | 'ORDERS' | 'SCAN' | 'FEED';
  onSelectTab?: (tab: 'HOME' | 'ORDERS' | 'SCAN' | 'FEED') => void;
  orderCount?: number;
};

export default function BottomNav({ activeTab = 'HOME', onSelectTab, orderCount = 0 }: BottomNavProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onSelectTab && onSelectTab('HOME')}
      >
        <Text style={[styles.icon, activeTab === 'HOME' && styles.active]}>⌂</Text>
        <Text style={[styles.label, activeTab === 'HOME' && styles.active]}>DISCOVER</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onSelectTab && onSelectTab('ORDERS')}
      >
        <View style={styles.iconBadgeWrapper}>
          <Text style={[styles.icon, activeTab === 'ORDERS' && styles.active]}>🎟️</Text>
          {orderCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{orderCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.label, activeTab === 'ORDERS' && styles.active]}>MY ORDERS</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onSelectTab && onSelectTab('SCAN')}
      >
        <Text style={[styles.icon, activeTab === 'SCAN' && styles.active]}>◎</Text>
        <Text style={[styles.label, activeTab === 'SCAN' && styles.active]}>SCAN</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onSelectTab && onSelectTab('FEED')}
      >
        <Text style={[styles.icon, activeTab === 'FEED' && styles.active]}>♨</Text>
        <Text style={[styles.label, activeTab === 'FEED' && styles.active]}>FEED</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fffbf2f5',
    borderTopWidth: 1,
    borderTopColor: '#eadfd2',
    paddingBottom: 16,
    paddingTop: 8,
    zIndex: 30,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconBadgeWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#E13328',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  icon: {
    fontSize: 18,
    color: '#725e55',
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: '#725e55',
    letterSpacing: 0.5,
  },
  active: {
    color: '#E13328',
  },
});
