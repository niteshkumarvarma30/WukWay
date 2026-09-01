import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const FILTERS = ['All', 'Under ₹100', 'Spicy', 'Trending'];

export default function FilterChips() {
  const [active, setActive] = useState('All');

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => (
        <TouchableOpacity 
          key={f}
          style={[styles.chip, active === f && styles.chipActive]}
          onPress={() => setActive(f)}
        >
          <Text style={[styles.chipText, active === f && styles.chipTextActive]}>
            {f}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#eadfd2',
    backgroundColor: '#fffdf8',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#321a12',
    borderColor: '#321a12',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2B1710',
  },
  chipTextActive: {
    color: '#fff',
  }
});
