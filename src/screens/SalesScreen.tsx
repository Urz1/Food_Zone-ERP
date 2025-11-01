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
import { SaleItem } from '../types';

const SalesScreen = () => {
  const { sales, inventory, addSale } = useData();
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
      Alert.alert('Error', 'Please add at least one item');
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>Total Sales: ${totalSales.toFixed(2)}</Text>
        <Text style={styles.statsText}>Transactions: {sales.length}</Text>
      </View>

      <ScrollView style={styles.content}>
        {sales.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sales yet</Text>
          </View>
        ) : (
          sales.map(sale => (
            <View key={sale.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{sale.date}</Text>
                <Text style={styles.total}>${sale.total.toFixed(2)}</Text>
              </View>

              {sale.items.map((item, idx) => (
                <Text key={idx} style={styles.itemText}>
                  • {item.itemName} - {item.quantity} × ${item.unitPrice}
                </Text>
              ))}

              {sale.paymentMethod && (
                <Text style={styles.paymentText}>Payment: {sale.paymentMethod}</Text>
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
            <Text style={styles.modalTitle}>New Sale</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.sectionTitle}>Add Items</Text>

            <Text style={styles.label}>Quick Select (Optional)</Text>
            <ScrollView horizontal style={styles.itemSelector}>
              {inventory.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemChip}
                  onPress={() =>
                    setCurrentItem({
                      itemId: item.id,
                      itemName: item.name,
                      quantity: '',
                      unitPrice: item.costPerUnit.toString()
                    })
                  }
                >
                  <Text style={styles.itemChipText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={currentItem.itemName}
              onChangeText={text => setCurrentItem({ ...currentItem, itemName: text })}
              placeholder="Item name"
            />

            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              value={currentItem.quantity}
              onChangeText={text => setCurrentItem({ ...currentItem, quantity: text })}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={styles.label}>Unit Price *</Text>
            <TextInput
              style={styles.input}
              value={currentItem.unitPrice}
              onChangeText={text => setCurrentItem({ ...currentItem, unitPrice: text })}
              keyboardType="numeric"
              placeholder="0.00"
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
                      {item.quantity} × ${item.unitPrice} = ${item.total.toFixed(2)}
                    </Text>
                  </View>
                ))}
                <Text style={styles.previewTotal}>
                  Total: ${items.reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.paymentMethods}>
              {['Cash', 'Card', 'Mobile'].map(method => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentChip,
                    paymentMethod === method && styles.paymentChipActive
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.paymentChipText,
                      paymentMethod === method && styles.paymentChipTextActive
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
  statsBar: {
    backgroundColor: '#FFF',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759'
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
    marginBottom: 12
  },
  date: {
    fontSize: 12,
    color: '#666'
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759'
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  paymentText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8
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
  itemChipText: {
    fontSize: 14,
    color: '#333'
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
  },
  previewTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#34C759'
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  paymentChip: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD'
  },
  paymentChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  paymentChipText: {
    fontSize: 14,
    color: '#333'
  },
  paymentChipTextActive: {
    color: '#FFF',
    fontWeight: '600'
  }
});

export default SalesScreen;
