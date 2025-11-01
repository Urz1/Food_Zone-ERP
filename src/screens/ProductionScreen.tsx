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
import { useNavigation } from '@react-navigation/native';

const ProductionScreen = () => {
  const navigation = useNavigation();
  const { productions, recipes, addProduction } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setSelectedRecipeId('');
    setQuantity('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedRecipeId || !quantity) {
      Alert.alert('Error', 'Please select recipe and enter quantity');
      return;
    }

    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;

    await addProduction({
      recipeId: selectedRecipeId,
      recipeName: recipe.name,
      quantity: parseFloat(quantity),
      date,
      notes: notes || undefined
    });

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Production</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {productions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No production batches yet</Text>
          </View>
        ) : (
          productions.map(prod => (
            <View key={prod.id} style={styles.card}>
              <Text style={styles.recipeName}>{prod.recipeName}</Text>
              <Text style={styles.quantity}>
                Quantity: {prod.quantity} batches
              </Text>
              <Text style={styles.date}>{prod.date}</Text>
              {prod.notes && <Text style={styles.notes}>Notes: {prod.notes}</Text>}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Sales' as never)}
        >
          <Text style={styles.navButtonText}>💰 Sales</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Expenses' as never)}
        >
          <Text style={styles.navButtonText}>💳 Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Reports' as never)}
        >
          <Text style={styles.navButtonText}>📊 Reports</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.modalTitle}>New Production</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Select Recipe *</Text>
            {recipes.map(recipe => (
              <TouchableOpacity
                key={recipe.id}
                style={[
                  styles.recipeCard,
                  selectedRecipeId === recipe.id && styles.recipeCardActive
                ]}
                onPress={() => setSelectedRecipeId(recipe.id)}
              >
                <Text style={styles.recipeCardName}>{recipe.name}</Text>
                <Text style={styles.recipeCardYield}>
                  Yields: {recipe.yieldQuantity} {recipe.yieldUnit}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.label}>Number of Batches *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="1"
            />

            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
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
  backButton: {
    padding: 4
  },
  backText: {
    color: '#007AFF',
    fontSize: 16
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
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  quantity: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
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
  bottomNav: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: 20
  },
  navButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center'
  },
  navButtonText: {
    fontSize: 14,
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
  recipeCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#DDD'
  },
  recipeCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD'
  },
  recipeCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  recipeCardYield: {
    fontSize: 12,
    color: '#666'
  }
});

export default ProductionScreen;
