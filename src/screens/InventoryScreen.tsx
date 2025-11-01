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
import { useData } from '../contexts/DataContext';
import { InventoryItem } from '../types';

const InventoryScreen = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();
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
      Alert.alert('Error', 'Please fill all required fields');
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {inventory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No inventory items yet</Text>
            <Text style={styles.emptySubtext}>Tap + Add to create your first item</Text>
          </View>
        ) : (
          inventory.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSku}>{item.sku}</Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.itemDetail}>
                  Stock: {item.quantity} {item.unit}
                </Text>
                <Text style={styles.itemDetail}>
                  Cost: ${item.costPerUnit}/{item.unit}
                </Text>
                <Text style={styles.itemDetail}>
                  Reorder Level: {item.reorderLevel}
                </Text>
              </View>

              {item.quantity <= item.reorderLevel && (
                <View style={styles.lowStockBadge}>
                  <Text style={styles.lowStockText}>⚠️ Low Stock</Text>
                </View>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add Item'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              placeholder="e.g., Tomatoes"
            />

            <Text style={styles.label}>SKU *</Text>
            <TextInput
              style={styles.input}
              value={formData.sku}
              onChangeText={text => setFormData({ ...formData, sku: text })}
              placeholder="e.g., TOM-001"
            />

            <Text style={styles.label}>Unit *</Text>
            <TextInput
              style={styles.input}
              value={formData.unit}
              onChangeText={text => setFormData({ ...formData, unit: text })}
              placeholder="e.g., kg, pieces, liters"
            />

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity}
              onChangeText={text => setFormData({ ...formData, quantity: text })}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={styles.label}>Reorder Level</Text>
            <TextInput
              style={styles.input}
              value={formData.reorderLevel}
              onChangeText={text => setFormData({ ...formData, reorderLevel: text })}
              keyboardType="numeric"
              placeholder="10"
            />

            <Text style={styles.label}>Cost Per Unit</Text>
            <TextInput
              style={styles.input}
              value={formData.costPerUnit}
              onChangeText={text => setFormData({ ...formData, costPerUnit: text })}
              keyboardType="numeric"
              placeholder="0.00"
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
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 16
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999'
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  cardHeader: {
    marginBottom: 12
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  itemSku: {
    fontSize: 12,
    color: '#666'
  },
  cardBody: {
    marginBottom: 12
  },
  itemDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  lowStockBadge: {
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12
  },
  lowStockText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: '600'
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  modalHeader: {
    backgroundColor: '#FFF',
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16
  },
  saveText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD'
  }
});

export default InventoryScreen;
