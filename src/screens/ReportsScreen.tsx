import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';

const ReportsScreen = () => {
  const { inventory, sales, expenses, purchases } = useData();
  const { t } = useTranslation();
  const { theme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={t('navigation.reports')} />

      <View style={[styles.tabs, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            { borderColor: theme.colors.border },
            activeTab === 'inventory' && [styles.tabActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('inventory')}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.textSecondary },
              activeTab === 'inventory' && [styles.tabTextActive, { color: theme.colors.surface }]
            ]}
          >
            {t('navigation.inventory')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { borderColor: theme.colors.border },
            activeTab === 'sales' && [styles.tabActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('sales')}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.textSecondary },
              activeTab === 'sales' && [styles.tabTextActive, { color: theme.colors.surface }]
            ]}
          >
            {t('navigation.sales')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { borderColor: theme.colors.border },
            activeTab === 'pl' && [styles.tabActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('pl')}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.textSecondary },
              activeTab === 'pl' && [styles.tabTextActive, { color: theme.colors.surface }]
            ]}
          >
            {t('common.profitLoss', { defaultValue: 'P&L' })}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'inventory' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.inventoryReport', { defaultValue: 'Inventory Report' })}</Text>
            {inventory.map(item => (
              <View key={item.id} style={[styles.reportCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                <View style={styles.reportRow}>
                  <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>{t('common.stock')}:</Text>
                  <Text style={[styles.reportValue, { color: theme.colors.text }]}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>{t('common.value')}:</Text>
                  <Text style={[styles.reportValue, { color: theme.colors.text }]}>
                    ${(item.quantity * item.costPerUnit).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>{t('common.costPerUnit', { defaultValue: 'Cost/Unit' })}:</Text>
                  <Text style={[styles.reportValue, { color: theme.colors.text }]}>${item.costPerUnit.toFixed(2)}</Text>
                </View>
              </View>
            ))}

             <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
               <Text style={[styles.summaryTitle, { color: theme.colors.surface }]}>{t('common.totalInventoryValue', { defaultValue: 'Total Inventory Value' })}</Text>
               <Text style={[styles.summaryAmount, { color: theme.colors.surface }]}>
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
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.salesReport', { defaultValue: 'Sales Report' })}</Text>

             <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
               <Text style={[styles.summaryTitle, { color: theme.colors.surface }]}>{t('common.totalSales', { defaultValue: 'Total Sales' })}</Text>
               <Text style={[styles.summaryAmount, { color: theme.colors.surface }]}>
                 ${pl.totalRevenue.toFixed(2)}
               </Text>
               <Text style={[styles.summarySubtext, { color: theme.colors.surface, opacity: 0.8 }]}>
                 {sales.length} {t('common.transactions', { defaultValue: 'transactions' })}
               </Text>
             </View>

            {sales.map(sale => (
              <View key={sale.id} style={[styles.reportCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.reportRow}>
                  <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>{t('common.date')}:</Text>
                  <Text style={[styles.reportValue, { color: theme.colors.text }]}>{sale.date}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>{t('common.items')}:</Text>
                  <Text style={[styles.reportValue, { color: theme.colors.text }]}>{sale.items.length}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>{t('common.total')}:</Text>
                  <Text style={[styles.reportValue, { color: theme.colors.success, fontWeight: 'bold' }]}>
                    ${sale.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'pl' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.profitLossStatement', { defaultValue: 'Profit & Loss Statement' })}</Text>

            <View style={[styles.plCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.plSection}>
                <Text style={[styles.plSectionTitle, { color: theme.colors.text }]}>{t('common.revenue', { defaultValue: 'Revenue' })}</Text>
                <View style={styles.plRow}>
                  <Text style={[styles.plLabel, { color: theme.colors.textSecondary }]}>{t('common.totalSales', { defaultValue: 'Total Sales' })}</Text>
                  <Text style={[styles.plValue, { color: theme.colors.success }]}>
                    ${pl.totalRevenue.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={[styles.plDivider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.plSection}>
                <Text style={[styles.plSectionTitle, { color: theme.colors.text }]}>{t('common.costOfGoodsSold', { defaultValue: 'Cost of Goods Sold' })}</Text>
                <View style={styles.plRow}>
                  <Text style={[styles.plLabel, { color: theme.colors.textSecondary }]}>{t('navigation.purchases')}</Text>
                  <Text style={[styles.plValue, { color: theme.colors.error }]}>
                    ${pl.totalCOGS.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={[styles.plDivider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.plSection}>
                <View style={styles.plRow}>
                  <Text style={[styles.plSectionTitle, { color: theme.colors.text }]}>{t('common.grossProfit', { defaultValue: 'Gross Profit' })}</Text>
                  <Text
                    style={[
                      styles.plTotal,
                      { color: pl.grossProfit >= 0 ? theme.colors.success : theme.colors.error }
                    ]}
                  >
                    ${pl.grossProfit.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={[styles.plDivider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.plSection}>
                <Text style={[styles.plSectionTitle, { color: theme.colors.text }]}>{t('common.operatingExpenses', { defaultValue: 'Operating Expenses' })}</Text>
                <View style={styles.plRow}>
                  <Text style={[styles.plLabel, { color: theme.colors.textSecondary }]}>{t('common.totalExpenses', { defaultValue: 'Total Expenses' })}</Text>
                  <Text style={[styles.plValue, { color: theme.colors.error }]}>
                    ${pl.totalExpenses.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={[styles.plDivider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.plSection}>
                <View style={styles.plRow}>
                  <Text style={[styles.plSectionTitle, { fontSize: 18, color: theme.colors.text }]}>
                    {t('common.netProfit', { defaultValue: 'Net Profit' })}
                  </Text>
                  <Text
                    style={[
                      styles.plTotal,
                      { fontSize: 24, color: pl.netProfit >= 0 ? theme.colors.success : theme.colors.error }
                    ]}
                  >
                    ${pl.netProfit.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{t('common.grossMargin', { defaultValue: 'Gross Margin' })}</Text>
                <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                  {pl.totalRevenue > 0
                    ? ((pl.grossProfit / pl.totalRevenue) * 100).toFixed(1)
                    : 0}
                  %
                </Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{t('common.netMargin', { defaultValue: 'Net Margin' })}</Text>
                <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
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
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
  },
  tabTextActive: {
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
   },
   reportValue: {
     fontSize: 14,
     fontWeight: '600',
   },
   summaryCard: {
     borderRadius: 12,
     padding: 20,
     marginBottom: 16,
     alignItems: 'center'
   },
   summaryTitle: {
     fontSize: 14,
     marginBottom: 8
   },
   summaryAmount: {
     fontSize: 32,
     fontWeight: 'bold',
   },
   summarySubtext: {
     fontSize: 12,
     marginTop: 4,
     opacity: 0.8
   },
   plCard: {
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
     marginVertical: 12
   },
   metricsGrid: {
     flexDirection: 'row',
     gap: 12
   },
   metricCard: {
     flex: 1,
     borderRadius: 12,
     padding: 16,
     alignItems: 'center'
   },
   metricLabel: {
     fontSize: 12,
     marginBottom: 8
   },
   metricValue: {
     fontSize: 20,
     fontWeight: 'bold',
   }
});

export default ReportsScreen;
