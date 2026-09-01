import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type VendorCardProps = {
  id: string;
  name: string;
  sub: string;
  price: string;
  img: string;
  walk: number;
  tag?: string;
  activity?: string;
  onPress: () => void;
};

export default function VendorCard({ id, name, sub, price, img, walk, tag, activity, onPress }: VendorCardProps) {


  return (
    <View style={styles.card}>
      <View style={styles.walkBadge}>
        <Text style={styles.walkText}>{walk} min</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name}>
            <Text style={styles.greenDot}>● </Text>{name}
          </Text>
          <Text style={styles.sub}>{sub}</Text>
          <Text style={styles.price}>₹{price}</Text>
        </View>
        
        <Image source={{ uri: img }} style={styles.thumb} />
      </View>
      
      {tag && (
        <View style={styles.tagWrapper}>
          <Text style={styles.tag}>{tag}</Text>
        </View>
      )}
      
      {activity && (
        <Text style={styles.activity}>🔥 {activity}</Text>
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={onPress} 
      >
        <Text style={styles.buttonText}>Quick choices · full menu →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#eadfd2',
    borderRadius: 17,
    padding: 12,
    marginBottom: 11,
    position: 'relative',
    marginLeft: 28, // space for the lane line
  },
  walkBadge: {
    position: 'absolute',
    left: -27,
    top: 31,
  },
  walkText: {
    color: '#E13328',
    fontSize: 8,
    fontWeight: '900',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2B1710',
  },
  greenDot: {
    color: '#4c8755',
    fontSize: 10,
  },
  sub: {
    fontSize: 11,
    color: '#806c61',
    marginTop: 3,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 5,
    color: '#2B1710',
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 13,
  },
  tagWrapper: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#FFC22E',
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    fontSize: 8,
    fontWeight: '900',
    color: '#2B1710',
  },
  activity: {
    backgroundColor: '#321a12',
    color: '#FFC22E',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 9,
  },
  button: {
    backgroundColor: '#E13328',
    borderRadius: 12,
    padding: 11,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 10,
  }
});
