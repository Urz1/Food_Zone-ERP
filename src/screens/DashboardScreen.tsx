import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const { getDashboardStats } = useData();
  const stats = getDashboardStats();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.subtitle}>Today's Overview</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.salesCard]}>
            <Text style={styles.statLabel}>Today's Sales</Text>
            <Text style={styles.statValue}>${stats.todaySales.toFixed(2)}</Text>
          </View>

          <View style={[styles.statCard, styles.expensesCard]}>
            <Text style={styles.statLabel}>Today's Expenses</Text>
            <Text style={styles.statValue}>${stats.todayExpenses.toFixed(2)}</Text>
          </View>

          <View style={[styles.statCard, styles.inventoryCard]}>
            <Text style={styles.statLabel}>Inventory Value</Text>
            <Text style={styles.statValue}>${stats.inventoryValue.toFixed(2)}</Text>
          </View>

          <View style={[styles.statCard, styles.profitCard]}>
            <Text style={styles.statLabel}>Today's Net</Text>
            <Text style={styles.statValue}>
              ${(stats.todaySales - stats.todayExpenses).toFixed(2)}
            </Text>
          </View>
        </View>

        {stats.lowStockItems.length > 0 && (
          <View style={styles.alertSection}>
            <Text style={styles.alertTitle}>⚠️ Low Stock Alerts</Text>
            {stats.lowStockItems.map(item => (
              <View key={item.id} style={styles.alertItem}>
                <Text style={styles.alertItemName}>{item.name}</Text>
                <Text style={styles.alertItemDetail}>
                  {item.quantity} {item.unit} (Reorder at {item.reorderLevel})
                </Text>
              </View>
            ))}
          </View>
        )}

        {stats.expiringItems.length > 0 && (
          <View style={styles.alertSection}>
            <Text style={styles.alertTitle}>📅 Expiring Soon</Text>
            {stats.expiringItems.map(({ item, batch }) => (
              <View key={batch.id} style={styles.alertItem}>
                <Text style={styles.alertItemName}>{item.name}</Text>
                <Text style={styles.alertItemDetail}>
                  Batch {batch.batchNumber} - Expires: {batch.expiryDate}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  logoutButton: {
    padding: 8
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFF'
  },
  salesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759'
  },
  expensesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30'
  },
  inventoryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  profitCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  alertSection: {
    margin: 12,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  alertItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  alertItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  alertItemDetail: {
    fontSize: 12,
    color: '#666'
  }
});

export default DashboardScreen;
