import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HeroSection() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.location}>📍 Patia, near KIIT · walking distance</Text>
      
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>SKIP LANE · ZERO WAITING</Text>
        <Text style={styles.heading}>
          Order ahead.{'\n'}
          Eat it <Text style={styles.highlight}>hot.</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 70 + 18, // header height + padding
  },
  location: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B1710',
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  hero: {
    marginHorizontal: 22,
    backgroundColor: '#E13328',
    borderRadius: 20,
    paddingTop: 19,
    paddingHorizontal: 19,
    paddingBottom: 30,
    // Add zigzag clip path logic or bottom decoration later
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: '#fff',
    opacity: 0.8,
  },
  heading: {
    fontSize: 29,
    lineHeight: 32,
    letterSpacing: -1.5,
    color: '#fff',
    fontWeight: '900',
    marginTop: 8,
  },
  highlight: {
    color: '#FFC22E', // yellow
  }
});
