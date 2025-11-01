import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { SaleItem } from '../types';
import AppHeader from '../components/AppHeader';

const SalesScreen = () => {
  const { sales, inventory, addSale } = useData();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    itemId: '',
    itemName: '',
    quantity: '',
    unitPrice: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const openAddModal = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setItems([]);
    setPaymentMethod('Cash');
    setModalVisible(true);
  };

  const addItem = () => {
    if (!currentItem.itemName || !currentItem.quantity || !currentItem.unitPrice) {
      Alert.alert('Error', 'Please fill item details');
      return;
    }

    const newItem: SaleItem = {
      itemId: currentItem.itemId || undefined,
      itemName: currentItem.itemName,
      quantity: parseFloat(currentItem.quantity),
      unitPrice: parseFloat(currentItem.unitPrice),
      total: parseFloat(currentItem.quantity) * parseFloat(currentItem.unitPrice)
    };

    setItems([...items, newItem]);
    setCurrentItem({ itemId: '', itemName: '', quantity: '', unitPrice: '' });
  };

  const handleSave = async () => {
    if (items.length === 0) {
      Alert.alert(t('common.error'), t('common.addAtLeastOneItem', { defaultValue: 'Please add at least one item' }));
      return;
    }

    const total = items.reduce((sum, item) => sum + item.total, 0);

    await addSale({
      date,
      items,
      total,
      paymentMethod,
      notes: undefined
    });

    setModalVisible(false);
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={t('navigation.sales')} />

      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={openAddModal}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>+ {t('common.new')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statsBar, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.statsText, { color: theme.colors.text }]}>
          {t('common.totalSales', { defaultValue: 'Total Sales' })}: ${totalSales.toFixed(2)}
        </Text>
        <Text style={[styles.statsText, { color: theme.colors.text }]}>
          {t('common.transactions', { defaultValue: 'Transactions' })}: {sales.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {sales.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('common.noSales', { defaultValue: 'No sales yet' })}
            </Text>
          </View>
        ) : (
          sales.map(sale => (
            <View key={sale.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{sale.date}</Text>
                <Text style={[styles.total, { color: theme.colors.text }]}>${sale.total.toFixed(2)}</Text>
              </View>

              {sale.items.map((item, idx) => (
                <Text key={idx} style={[styles.itemText, { color: theme.colors.text }]}>
                  • {item.itemName} - {item.quantity} × ${item.unitPrice}
                </Text>
              ))}

              {sale.paymentMethod && (
                <Text style={[styles.paymentText, { color: theme.colors.textSecondary }]}>
                  {t('common.payment', { defaultValue: 'Payment' })}: {sale.paymentMethod}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.cancelText, { color: theme.colors.primary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('common.new')} {t('navigation.sales')}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.saveText, { color: theme.colors.primary }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.date')} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={date}
              onChangeText={setDate}
              placeholder={t('common.datePlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.addItems', { defaultValue: 'Add Items' })}</Text>

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.quickSelect', { defaultValue: 'Quick Select (Optional)' })}</Text>
            <ScrollView horizontal style={styles.itemSelector}>
              {inventory.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemChip, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  }]}
                  onPress={() =>
                    setCurrentItem({
                      itemId: item.id,
                      itemName: item.name,
                      quantity: '',
                      unitPrice: item.costPerUnit.toString()
                    })
                  }
                >
                  <Text style={[styles.itemChipText, { color: theme.colors.text }]}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.name')} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={currentItem.itemName}
              onChangeText={text => setCurrentItem({ ...currentItem, itemName: text })}
              placeholder={t('common.itemName', { defaultValue: 'Item name' })}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.quantity')} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={currentItem.quantity}
              onChangeText={text => setCurrentItem({ ...currentItem, quantity: text })}
              keyboardType="numeric"
              placeholder={t('common.quantityPlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.unitPrice', { defaultValue: 'Unit Price' })} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={currentItem.unitPrice}
              onChangeText={text => setCurrentItem({ ...currentItem, unitPrice: text })}
              keyboardType="numeric"
              placeholder={t('common.amountPlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <TouchableOpacity style={[styles.addItemButton, { backgroundColor: theme.colors.success }]} onPress={addItem}>
              <Text style={[styles.addItemButtonText, { color: theme.colors.surface }]}>+ {t('common.addItem', { defaultValue: 'Add Item' })}</Text>
            </TouchableOpacity>

            {items.length > 0 && (
              <View style={[styles.itemsPreview, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.itemsAdded', { defaultValue: 'Items Added' })}</Text>
                {items.map((item, idx) => (
                  <View key={idx} style={[styles.previewItem, { borderBottomColor: theme.colors.borderLight }]}>
                    <Text style={[styles.previewItemName, { color: theme.colors.text }]}>{item.itemName}</Text>
                    <Text style={[styles.previewItemDetail, { color: theme.colors.textSecondary }]}>
                      {item.quantity} × ${item.unitPrice} = ${item.total.toFixed(2)}
                    </Text>
                  </View>
                ))}
                <Text style={[styles.previewTotal, { color: theme.colors.success }]}>
                  {t('common.total')}: ${items.reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                </Text>
              </View>
            )}

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.paymentMethod', { defaultValue: 'Payment Method' })}</Text>
            <View style={styles.paymentMethods}>
              {['Cash', 'Card', 'Mobile'].map(method => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentChip,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border
                    },
                    paymentMethod === method && [styles.paymentChipActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.paymentChipText,
                      { color: theme.colors.text },
                      paymentMethod === method && [styles.paymentChipTextActive, { color: theme.colors.surface }]
                    ]}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionBar: {
    padding: 16,
    paddingTop: 0,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontWeight: '600',
  },
  statsBar: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 12,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelText: {
    fontSize: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
  },
  itemSelector: {
    marginBottom: 16,
  },
  itemChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  itemChipText: {
    fontSize: 14,
  },
  addItemButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addItemButtonText: {
    fontWeight: '600',
  },
  itemsPreview: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  previewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  previewItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewItemDetail: {
    fontSize: 12,
  },
  previewTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  paymentChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  paymentChipActive: {},
  paymentChipText: {
    fontSize: 14,
  },
  paymentChipTextActive: {
    fontWeight: '600',
  },
});

export default SalesScreen;
