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
import { PurchaseItem } from '../types';
import AppHeader from '../components/AppHeader';

const PurchasesScreen = () => {
  const { purchases, inventory, addPurchase, receivePurchase } = useData();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    itemId: '',
    quantity: '',
    unitCost: '',
    batchNumber: '',
    expiryDate: ''
  });

  const openAddModal = () => {
    setFormData({
      supplier: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setItems([]);
    setModalVisible(true);
  };

  const addItem = () => {
    if (!currentItem.itemId || !currentItem.quantity || !currentItem.unitCost) {
      Alert.alert(t('common.error'), t('common.fillItemDetails', { defaultValue: 'Please fill item details' }));
      return;
    }

    const inventoryItem = inventory.find(i => i.id === currentItem.itemId);
    if (!inventoryItem) return;

    const newItem: PurchaseItem = {
      itemId: currentItem.itemId,
      itemName: inventoryItem.name,
      quantity: parseFloat(currentItem.quantity),
      unitCost: parseFloat(currentItem.unitCost),
      total: parseFloat(currentItem.quantity) * parseFloat(currentItem.unitCost),
      batchNumber: currentItem.batchNumber || undefined,
      expiryDate: currentItem.expiryDate || undefined
    };

    setItems([...items, newItem]);
    setCurrentItem({
      itemId: '',
      quantity: '',
      unitCost: '',
      batchNumber: '',
      expiryDate: ''
    });
  };

  const handleSave = async () => {
    if (!formData.supplier || items.length === 0) {
      Alert.alert(t('common.error'), t('common.enterSupplierAndItems', { defaultValue: 'Please enter supplier and add at least one item' }));
      return;
    }

    const total = items.reduce((sum, item) => sum + item.total, 0);

    await addPurchase({
      supplier: formData.supplier,
      date: formData.date,
      items,
      total,
      status: 'pending',
      notes: formData.notes || undefined
    });

    setModalVisible(false);
  };

  const handleReceive = (purchaseId: string) => {
    Alert.alert('Receive Purchase', 'Mark this purchase as received and update inventory?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Receive',
        onPress: () => receivePurchase(purchaseId)
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={t('navigation.purchases')} />

      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={openAddModal}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>+ {t('common.new')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {purchases.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('common.noPurchases', { defaultValue: 'No purchases yet' })}
            </Text>
          </View>
        ) : (
          purchases.map(purchase => (
            <View key={purchase.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.supplier, { color: theme.colors.text }]}>{purchase.supplier}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: purchase.status === 'pending' ? theme.colors.warning : theme.colors.success },
                    purchase.status === 'received' && styles.receivedBadge
                  ]}
                >
                  <Text style={[styles.statusText, { color: theme.colors.surface }]}>{purchase.status}</Text>
                </View>
              </View>

              <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{purchase.date}</Text>

              <View style={styles.itemsList}>
                {purchase.items.map((item, idx) => (
                  <Text key={idx} style={[styles.itemText, { color: theme.colors.text }]}>
                    • {item.itemName} - {item.quantity} @ ${item.unitCost}
                  </Text>
                ))}
              </View>

              <Text style={[styles.total, { color: theme.colors.text }]}>
                {t('common.total')}: ${purchase.total.toFixed(2)}
              </Text>

              {purchase.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.receiveButton, { backgroundColor: theme.colors.success }]}
                  onPress={() => handleReceive(purchase.id)}
                >
                  <Text style={[styles.receiveButtonText, { color: theme.colors.surface }]}>
                    {t('common.receivePurchase', { defaultValue: 'Receive Purchase' })}
                  </Text>
                </TouchableOpacity>
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
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('common.new')} {t('navigation.purchases')}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.saveText, { color: theme.colors.primary }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.supplier', { defaultValue: 'Supplier' })} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.supplier}
              onChangeText={text => setFormData({ ...formData, supplier: text })}
              placeholder={t('common.supplierName', { defaultValue: 'Supplier name' })}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.date')} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.date}
              onChangeText={text => setFormData({ ...formData, date: text })}
              placeholder={t('common.datePlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.addItems', { defaultValue: 'Add Items' })}</Text>

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.selectItem', { defaultValue: 'Select Item' })} *</Text>
            <ScrollView horizontal style={styles.itemSelector}>
              {inventory.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.itemChip,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border
                    },
                    currentItem.itemId === item.id && [styles.itemChipActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
                  ]}
                  onPress={() => setCurrentItem({ ...currentItem, itemId: item.id })}
                >
                  <Text
                    style={[
                      styles.itemChipText,
                      { color: theme.colors.text },
                      currentItem.itemId === item.id && [styles.itemChipTextActive, { color: theme.colors.surface }]
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.unitCost', { defaultValue: 'Unit Cost' })} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={currentItem.unitCost}
              onChangeText={text => setCurrentItem({ ...currentItem, unitCost: text })}
              keyboardType="numeric"
              placeholder={t('common.amountPlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.batchNumber', { defaultValue: 'Batch Number (Optional)' })}</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={currentItem.batchNumber}
              onChangeText={text => setCurrentItem({ ...currentItem, batchNumber: text })}
              placeholder={t('common.batchPlaceholder', { defaultValue: 'Batch #' })}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.expiryDate', { defaultValue: 'Expiry Date (Optional)' })}</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={currentItem.expiryDate}
              onChangeText={text => setCurrentItem({ ...currentItem, expiryDate: text })}
              placeholder={t('common.datePlaceholder')}
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
                      {item.quantity} × ${item.unitCost} = ${item.total.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.notes')}</Text>
            <TextInput
              style={[styles.input, styles.textArea, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.notes}
              onChangeText={text => setFormData({ ...formData, notes: text })}
              placeholder={t('common.additionalNotes', { defaultValue: 'Additional notes' })}
              placeholderTextColor={theme.colors.inputPlaceholder}
              multiline
              numberOfLines={3}
            />
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
    marginBottom: 8,
  },
  supplier: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  receivedBadge: {},
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
    marginBottom: 12,
  },
  itemsList: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  receiveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  receiveButtonText: {
    fontWeight: '600',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  itemChipActive: {},
  itemChipText: {
    fontSize: 14,
  },
  itemChipTextActive: {},
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
});

export default PurchasesScreen;
