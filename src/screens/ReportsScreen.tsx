import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useData } from '../contexts/DataContext';

const ReportsScreen = () => {
  const { inventory, sales, expenses, purchases } = useData();
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'pl'>('inventory');

  const calculatePL = () => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCOGS = purchases
      .filter(p => p.status === 'received')
      .reduce((sum, purchase) => sum + purchase.total, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;

    return {
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpenses,
      netProfit
    };
  };

  const pl = calculatePL();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inventory' && styles.tabActive]}
          onPress={() => setActiveTab('inventory')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'inventory' && styles.tabTextActive
            ]}
          >
            Inventory
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sales' && styles.tabActive]}
          onPress={() => setActiveTab('sales')}
        >
          <Text
            style={[styles.tabText, activeTab === 'sales' && styles.tabTextActive]}
          >
            Sales
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pl' && styles.tabActive]}
          onPress={() => setActiveTab('pl')}
        >
          <Text style={[styles.tabText, activeTab === 'pl' && styles.tabTextActive]}>
            P&amp;L
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'inventory' && (
          <View>
            <Text style={styles.sectionTitle}>Inventory Report</Text>
            {inventory.map(item => (
              <View key={item.id} style={styles.reportCard}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Stock:</Text>
                  <Text style={styles.reportValue}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Value:</Text>
                  <Text style={styles.reportValue}>
                    ${(item.quantity * item.costPerUnit).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Cost/Unit:</Text>
                  <Text style={styles.reportValue}>${item.costPerUnit.toFixed(2)}</Text>
                </View>
              </View>
            ))}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Total Inventory Value</Text>
              <Text style={styles.summaryAmount}>
                $
                {inventory
                  .reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0)
                  .toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'sales' && (
          <View>
            <Text style={styles.sectionTitle}>Sales Report</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Total Sales</Text>
              <Text style={[styles.summaryAmount, { color: '#34C759' }]}>
                ${pl.totalRevenue.toFixed(2)}
              </Text>
              <Text style={styles.summarySubtext}>
                {sales.length} transactions
              </Text>
            </View>

            {sales.map(sale => (
              <View key={sale.id} style={styles.reportCard}>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Date:</Text>
                  <Text style={styles.reportValue}>{sale.date}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Items:</Text>
                  <Text style={styles.reportValue}>{sale.items.length}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Total:</Text>
                  <Text style={[styles.reportValue, { color: '#34C759', fontWeight: 'bold' }]}>
                    ${sale.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'pl' && (
          <View>
            <Text style={styles.sectionTitle}>Profit &amp; Loss Statement</Text>

            <View style={styles.plCard}>
              <View style={styles.plSection}>
                <Text style={styles.plSectionTitle}>Revenue</Text>
                <View style={styles.plRow}>
                  <Text style={styles.plLabel}>Total Sales</Text>
                  <Text style={[styles.plValue, { color: '#34C759' }]}>
                    ${pl.totalRevenue.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.plDivider} />

              <View style={styles.plSection}>
                <Text style={styles.plSectionTitle}>Cost of Goods Sold</Text>
                <View style={styles.plRow}>
                  <Text style={styles.plLabel}>Purchases</Text>
                  <Text style={[styles.plValue, { color: '#FF3B30' }]}>
                    ${pl.totalCOGS.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.plDivider} />

              <View style={styles.plSection}>
                <View style={styles.plRow}>
                  <Text style={styles.plSectionTitle}>Gross Profit</Text>
                  <Text
                    style={[
                      styles.plTotal,
                      { color: pl.grossProfit >= 0 ? '#34C759' : '#FF3B30' }
                    ]}
                  >
                    ${pl.grossProfit.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.plDivider} />

              <View style={styles.plSection}>
                <Text style={styles.plSectionTitle}>Operating Expenses</Text>
                <View style={styles.plRow}>
                  <Text style={styles.plLabel}>Total Expenses</Text>
                  <Text style={[styles.plValue, { color: '#FF3B30' }]}>
                    ${pl.totalExpenses.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.plDivider} />

              <View style={styles.plSection}>
                <View style={styles.plRow}>
                  <Text style={[styles.plSectionTitle, { fontSize: 18 }]}>
                    Net Profit
                  </Text>
                  <Text
                    style={[
                      styles.plTotal,
                      { fontSize: 24, color: pl.netProfit >= 0 ? '#34C759' : '#FF3B30' }
                    ]}
                  >
                    ${pl.netProfit.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Gross Margin</Text>
                <Text style={styles.metricValue}>
                  {pl.totalRevenue > 0
                    ? ((pl.grossProfit / pl.totalRevenue) * 100).toFixed(1)
                    : 0}
                  %
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Net Margin</Text>
                <Text style={styles.metricValue}>
                  {pl.totalRevenue > 0
                    ? ((pl.netProfit / pl.totalRevenue) * 100).toFixed(1)
                    : 0}
                  %
                </Text>
              </View>
            </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: {
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 14,
    color: '#666'
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  reportCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  reportLabel: {
    fontSize: 14,
    color: '#666'
  },
  reportValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  summaryCard: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center'
  },
  summaryTitle: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF'
  },
  summarySubtext: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
    opacity: 0.8
  },
  plCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16
  },
  plSection: {
    marginVertical: 8
  },
  plSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  plRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  plLabel: {
    fontSize: 14,
    color: '#666'
  },
  plValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  plTotal: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  plDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF'
  }
});

export default ReportsScreen;
