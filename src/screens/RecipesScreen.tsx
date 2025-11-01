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
import { Recipe, RecipeIngredient } from '../types';

const RecipesScreen = () => {
  const { recipes, inventory, addRecipe, deleteRecipe } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    yieldQuantity: '',
    yieldUnit: '',
    notes: ''
  });
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState({
    itemId: '',
    quantity: ''
  });

  const openAddModal = () => {
    setFormData({
      name: '',
      sku: '',
      yieldQuantity: '',
      yieldUnit: '',
      notes: ''
    });
    setIngredients([]);
    setModalVisible(true);
  };

  const addIngredient = () => {
    if (!currentIngredient.itemId || !currentIngredient.quantity) {
      Alert.alert('Error', 'Please select item and enter quantity');
      return;
    }

    const item = inventory.find(i => i.id === currentIngredient.itemId);
    if (!item) return;

    const newIngredient: RecipeIngredient = {
      itemId: currentIngredient.itemId,
      itemName: item.name,
      quantity: parseFloat(currentIngredient.quantity),
      unit: item.unit
    };

    setIngredients([...ingredients, newIngredient]);
    setCurrentIngredient({ itemId: '', quantity: '' });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sku || ingredients.length === 0) {
      Alert.alert('Error', 'Please fill required fields and add ingredients');
      return;
    }

    await addRecipe({
      name: formData.name,
      sku: formData.sku,
      ingredients,
      yieldQuantity: parseFloat(formData.yieldQuantity) || 1,
      yieldUnit: formData.yieldUnit,
      notes: formData.notes || undefined
    });

    setModalVisible(false);
  };

  const handleDelete = (recipe: Recipe) => {
    Alert.alert('Delete Recipe', `Delete ${recipe.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRecipe(recipe.id)
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipes / BOM</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recipes yet</Text>
          </View>
        ) : (
          recipes.map(recipe => (
            <View key={recipe.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeSku}>{recipe.sku}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(recipe)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.yieldText}>
                Yields: {recipe.yieldQuantity} {recipe.yieldUnit}
              </Text>

              <Text style={styles.ingredientsTitle}>Ingredients:</Text>
              {recipe.ingredients.map((ing, idx) => (
                <Text key={idx} style={styles.ingredientText}>
                  • {ing.itemName} - {ing.quantity} {ing.unit}
                </Text>
              ))}
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
            <Text style={styles.modalTitle}>New Recipe</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Recipe Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              placeholder="e.g., Burger Patty"
            />

            <Text style={styles.label}>SKU *</Text>
            <TextInput
              style={styles.input}
              value={formData.sku}
              onChangeText={text => setFormData({ ...formData, sku: text })}
              placeholder="e.g., RCP-001"
            />

            <Text style={styles.label}>Yield Quantity</Text>
            <TextInput
              style={styles.input}
              value={formData.yieldQuantity}
              onChangeText={text => setFormData({ ...formData, yieldQuantity: text })}
              keyboardType="numeric"
              placeholder="1"
            />

            <Text style={styles.label}>Yield Unit</Text>
            <TextInput
              style={styles.input}
              value={formData.yieldUnit}
              onChangeText={text => setFormData({ ...formData, yieldUnit: text })}
              placeholder="e.g., pieces, kg"
            />

            <Text style={styles.sectionTitle}>Add Ingredients</Text>

            <Text style={styles.label}>Select Ingredient *</Text>
            <ScrollView horizontal style={styles.itemSelector}>
              {inventory.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.itemChip,
                    currentIngredient.itemId === item.id && styles.itemChipActive
                  ]}
                  onPress={() =>
                    setCurrentIngredient({ ...currentIngredient, itemId: item.id })
                  }
                >
                  <Text
                    style={[
                      styles.itemChipText,
                      currentIngredient.itemId === item.id && styles.itemChipTextActive
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
              value={currentIngredient.quantity}
              onChangeText={text =>
                setCurrentIngredient({ ...currentIngredient, quantity: text })
              }
              keyboardType="numeric"
              placeholder="0"
            />

            <TouchableOpacity style={styles.addButton2} onPress={addIngredient}>
              <Text style={styles.addButtonText}>+ Add Ingredient</Text>
            </TouchableOpacity>

            {ingredients.length > 0 && (
              <View style={styles.ingredientsPreview}>
                <Text style={styles.sectionTitle}>Ingredients Added</Text>
                {ingredients.map((ing, idx) => (
                  <Text key={idx} style={styles.previewText}>
                    • {ing.itemName} - {ing.quantity} {ing.unit}
                  </Text>
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
    alignItems: 'flex-start',
    marginBottom: 8
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  recipeSku: {
    fontSize: 12,
    color: '#666'
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600'
  },
  yieldText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 12
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  ingredientText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
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
  addButton2: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  ingredientsPreview: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  }
});

export default RecipesScreen;
