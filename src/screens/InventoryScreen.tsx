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
import { InventoryItem } from '../types';
import AppHeader from '../components/AppHeader';

const InventoryScreen = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    unit: '',
    quantity: '0',
    reorderLevel: '10',
    costPerUnit: '0'
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      sku: '',
      unit: '',
      quantity: '0',
      reorderLevel: '10',
      costPerUnit: '0'
    });
    setModalVisible(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      unit: item.unit,
      quantity: item.quantity.toString(),
      reorderLevel: item.reorderLevel.toString(),
      costPerUnit: item.costPerUnit.toString()
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sku || !formData.unit) {
      Alert.alert(t('common.error'), t('common.fillRequiredFields', { defaultValue: 'Please fill all required fields' }));
      return;
    }

    const itemData = {
      name: formData.name,
      sku: formData.sku,
      unit: formData.unit,
      quantity: parseFloat(formData.quantity) || 0,
      reorderLevel: parseFloat(formData.reorderLevel) || 0,
      costPerUnit: parseFloat(formData.costPerUnit) || 0
    };

    if (editingItem) {
      await updateInventoryItem(editingItem.id, itemData);
    } else {
      await addInventoryItem(itemData);
    }

    setModalVisible(false);
  };

  const handleDelete = (item: InventoryItem) => {
    Alert.alert('Delete Item', `Are you sure you want to delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteInventoryItem(item.id)
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={t('navigation.inventory')} />

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={openAddModal}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>+ {t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {inventory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('common.noData', { defaultValue: 'No inventory items yet' })}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
              {t('common.tapToAdd', { defaultValue: 'Tap + Add to create your first item' })}
            </Text>
          </View>
        ) : (
          inventory.map(item => (
            <View key={item.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemSku, { color: theme.colors.textSecondary }]}>{item.sku}</Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={[styles.itemDetail, { color: theme.colors.text }]}>
                  {t('common.stock', { defaultValue: 'Stock' })}: {item.quantity} {item.unit}
                </Text>
                <Text style={[styles.itemDetail, { color: theme.colors.text }]}>
                  {t('common.cost', { defaultValue: 'Cost' })}: ${item.costPerUnit}/{item.unit}
                </Text>
                <Text style={[styles.itemDetail, { color: theme.colors.text }]}>
                  {t('common.reorderLevel', { defaultValue: 'Reorder Level' })}: {item.reorderLevel}
                </Text>
              </View>

              {item.quantity <= item.reorderLevel && (
                <View style={[styles.lowStockBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Text style={[styles.lowStockText, { color: theme.colors.warning }]}>⚠️ {t('common.lowStock', { defaultValue: 'Low Stock' })}</Text>
                </View>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={[styles.editButtonText, { color: theme.colors.surface }]}>{t('common.edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={[styles.deleteButtonText, { color: theme.colors.surface }]}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
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
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingItem ? t('common.edit') + ' ' + t('common.item', { defaultValue: 'Item' }) : t('common.add') + ' ' + t('common.item', { defaultValue: 'Item' })}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.saveText, { color: theme.colors.primary }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.name')} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              placeholder={t('common.namePlaceholder', { defaultValue: 'e.g., Tomatoes' })}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>SKU *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.sku}
              onChangeText={text => setFormData({ ...formData, sku: text })}
              placeholder={t('common.skuPlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.unit')} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.unit}
              onChangeText={text => setFormData({ ...formData, unit: text })}
              placeholder={t('common.unitPlaceholder', { defaultValue: 'e.g., kg, pieces, liters' })}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.quantity')}</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.quantity}
              onChangeText={text => setFormData({ ...formData, quantity: text })}
              keyboardType="numeric"
              placeholder={t('common.quantityPlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.reorderLevel', { defaultValue: 'Reorder Level' })}</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.reorderLevel}
              onChangeText={text => setFormData({ ...formData, reorderLevel: text })}
              keyboardType="numeric"
              placeholder={t('common.quantityPlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.costPerUnit', { defaultValue: 'Cost Per Unit' })}</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.costPerUnit}
              onChangeText={text => setFormData({ ...formData, costPerUnit: text })}
              keyboardType="numeric"
              placeholder={t('common.amountPlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 12,
  },
  cardBody: {
    marginBottom: 12,
  },
  itemDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  lowStockBadge: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  lowStockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
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
});

export default InventoryScreen;
