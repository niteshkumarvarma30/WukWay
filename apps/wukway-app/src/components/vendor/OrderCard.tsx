import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

type OrderItem = {
  name: string;
  qty: number;
};

type OrderCardProps = {
  id: string;
  orderId: string;
  customerName: string;
  eta: string;
  items: OrderItem[];
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COLLECTED';
  pickupToken?: string;
  onUpdateStatus?: (id: string, newStatus: string) => Promise<void>;
};

export default function OrderCard({
  id,
  orderId,
  customerName,
  eta,
  items,
  status,
  pickupToken,
  onUpdateStatus,
}: OrderCardProps) {
  const [updating, setUpdating] = React.useState(false);

  const getButtonConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          text: '🔥 Accept & Start Cooking',
          nextStatus: 'PREPARING',
          color: '#FFC22E',
          textColor: '#2B1710',
        };
      case 'ACCEPTED':
      case 'PREPARING':
        return {
          text: '🛎️ Mark Ready for Pickup',
          nextStatus: 'READY',
          color: '#E13328',
          textColor: '#fff',
        };
      case 'READY':
        return {
          text: '✅ Verify Token & Hand Over',
          nextStatus: 'COLLECTED',
          color: '#2e7d32',
          textColor: '#fff',
        };
      case 'COLLECTED':
        return {
          text: 'Completed',
          nextStatus: null,
          color: '#eadfd2',
          textColor: '#806c61',
        };
      default:
        return {
          text: 'Update Status',
          nextStatus: 'PREPARING',
          color: '#FFC22E',
          textColor: '#2B1710',
        };
    }
  };

  const btn = getButtonConfig();

  const handlePress = async () => {
    if (!btn.nextStatus || !onUpdateStatus) return;
    setUpdating(true);
    try {
      await onUpdateStatus(id, btn.nextStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <View style={styles.idRow}>
            <Text style={styles.orderId}>Order #{orderId}</Text>
            {pickupToken && (
              <View style={styles.tokenPill}>
                <Text style={styles.tokenText}>{pickupToken}</Text>
              </View>
            )}
          </View>
          <Text style={styles.customer}>{customerName}</Text>
        </View>

        <View style={styles.etaBadge}>
          <Text style={styles.etaText}>{eta}</Text>
          <Text style={styles.etaSub}>WALK ETA</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.itemsList}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemQty}>{item.qty}x</Text>
            <Text style={styles.itemName}>{item.name}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: btn.color }, updating && { opacity: 0.7 }]}
        disabled={status === 'COLLECTED' || updating}
        onPress={handlePress}
      >
        {updating ? (
          <ActivityIndicator color={btn.textColor} />
        ) : (
          <Text style={[styles.actionButtonText, { color: btn.textColor }]}>{btn.text}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#806c61',
  },
  tokenPill: {
    backgroundColor: '#FFC22E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tokenText: {
    color: '#2B1710',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  customer: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2B1710',
    marginTop: 4,
  },
  etaBadge: {
    backgroundColor: '#2B1710',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  etaText: {
    color: '#FFC22E',
    fontSize: 18,
    fontWeight: '900',
  },
  etaSub: {
    color: '#FFC22E',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#eadfd2',
    marginBottom: 14,
  },
  itemsList: {
    marginBottom: 18,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQty: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E13328',
    marginRight: 10,
    width: 28,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B1710',
    flex: 1,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
});
