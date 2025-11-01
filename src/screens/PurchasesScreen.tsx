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
import { PurchaseItem } from '../types';

const PurchasesScreen = () => {
  const { purchases, inventory, addPurchase, receivePurchase } = useData();
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
      Alert.alert('Error', 'Please fill item details');
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
      Alert.alert('Error', 'Please enter supplier and add at least one item');
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Purchases</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {purchases.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No purchases yet</Text>
          </View>
        ) : (
          purchases.map(purchase => (
            <View key={purchase.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.supplier}>{purchase.supplier}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    purchase.status === 'received' && styles.receivedBadge
                  ]}
                >
                  <Text style={styles.statusText}>{purchase.status}</Text>
                </View>
              </View>

              <Text style={styles.date}>{purchase.date}</Text>

              <View style={styles.itemsList}>
                {purchase.items.map((item, idx) => (
                  <Text key={idx} style={styles.itemText}>
                    • {item.itemName} - {item.quantity} @ ${item.unitCost}
                  </Text>
                ))}
              </View>

              <Text style={styles.total}>Total: ${purchase.total.toFixed(2)}</Text>

              {purchase.status === 'pending' && (
                <TouchableOpacity
                  style={styles.receiveButton}
                  onPress={() => handleReceive(purchase.id)}
                >
                  <Text style={styles.receiveButtonText}>Receive Purchase</Text>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Purchase</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Supplier *</Text>
            <TextInput
              style={styles.input}
              value={formData.supplier}
              onChangeText={text => setFormData({ ...formData, supplier: text })}
              placeholder="Supplier name"
            />

            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={text => setFormData({ ...formData, date: text })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.sectionTitle}>Add Items</Text>

            <Text style={styles.label}>Select Item *</Text>
            <ScrollView horizontal style={styles.itemSelector}>
              {inventory.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.itemChip,
                    currentItem.itemId === item.id && styles.itemChipActive
                  ]}
                  onPress={() => setCurrentItem({ ...currentItem, itemId: item.id })}
                >
                  <Text
                    style={[
                      styles.itemChipText,
                      currentItem.itemId === item.id && styles.itemChipTextActive
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              value={currentItem.quantity}
              onChangeText={text => setCurrentItem({ ...currentItem, quantity: text })}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={styles.label}>Unit Cost *</Text>
            <TextInput
              style={styles.input}
              value={currentItem.unitCost}
              onChangeText={text => setCurrentItem({ ...currentItem, unitCost: text })}
              keyboardType="numeric"
              placeholder="0.00"
            />

            <Text style={styles.label}>Batch Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={currentItem.batchNumber}
              onChangeText={text => setCurrentItem({ ...currentItem, batchNumber: text })}
              placeholder="Batch #"
            />

            <Text style={styles.label}>Expiry Date (Optional)</Text>
            <TextInput
              style={styles.input}
              value={currentItem.expiryDate}
              onChangeText={text => setCurrentItem({ ...currentItem, expiryDate: text })}
              placeholder="YYYY-MM-DD"
            />

            <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
              <Text style={styles.addItemButtonText}>+ Add Item</Text>
            </TouchableOpacity>

            {items.length > 0 && (
              <View style={styles.itemsPreview}>
                <Text style={styles.sectionTitle}>Items Added</Text>
                {items.map((item, idx) => (
                  <View key={idx} style={styles.previewItem}>
                    <Text style={styles.previewItemName}>{item.itemName}</Text>
                    <Text style={styles.previewItemDetail}>
                      {item.quantity} × ${item.unitCost} = ${item.total.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={text => setFormData({ ...formData, notes: text })}
              placeholder="Additional notes"
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
    color: '#666'
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  supplier: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  statusBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  receivedBadge: {
    backgroundColor: '#34C759'
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12
  },
  itemsList: {
    marginBottom: 12
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  receiveButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  receiveButtonText: {
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
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12
  },
  itemSelector: {
    marginBottom: 16
  },
  itemChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  itemChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  itemChipText: {
    fontSize: 14,
    color: '#333'
  },
  itemChipTextActive: {
    color: '#FFF'
  },
  addItemButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  addItemButtonText: {
    color: '#FFF',
    fontWeight: '600'
  },
  itemsPreview: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  previewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  previewItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  previewItemDetail: {
    fontSize: 12,
    color: '#666'
  }
});

export default PurchasesScreen;
