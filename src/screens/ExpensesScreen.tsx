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

const ExpensesScreen = () => {
  const { expenses, addExpense } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Operations',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const categories = ['Operations', 'Utilities', 'Rent', 'Salaries', 'Supplies', 'Other'];

  const openAddModal = () => {
    setFormData({
      category: 'Operations',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.description || !formData.amount) {
      Alert.alert('Error', 'Please enter description and amount');
      return;
    }

    await addExpense({
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      notes: formData.notes || undefined
    });

    setModalVisible(false);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>Total: ${totalExpenses.toFixed(2)}</Text>
        <Text style={styles.statsText}>Count: {expenses.length}</Text>
      </View>

      <ScrollView style={styles.content}>
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expenses yet</Text>
          </View>
        ) : (
          expenses.map(expense => (
            <View key={expense.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.description}>{expense.description}</Text>
                  <Text style={styles.category}>{expense.category}</Text>
                </View>
                <Text style={styles.amount}>${expense.amount.toFixed(2)}</Text>
              </View>

              <Text style={styles.date}>{expense.date}</Text>
              {expense.notes && (
                <Text style={styles.notes}>Notes: {expense.notes}</Text>
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
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    formData.category === cat && styles.categoryChipActive
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat })}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      formData.category === cat && styles.categoryChipTextActive
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.input}
              value={formData.description}
              onChangeText={text => setFormData({ ...formData, description: text })}
              placeholder="e.g., Monthly rent"
            />

            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.input}
              value={formData.amount}
              onChangeText={text => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
              placeholder="0.00"
            />

            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={text => setFormData({ ...formData, date: text })}
              placeholder="YYYY-MM-DD"
            />

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
    color: '#FF3B30'
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
    alignItems: 'flex-start',
    marginBottom: 8
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  category: {
    fontSize: 12,
    color: '#666'
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30'
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  categoryChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333'
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: '600'
  }
});

export default ExpensesScreen;
