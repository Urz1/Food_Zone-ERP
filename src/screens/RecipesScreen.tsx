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
import { Recipe, RecipeIngredient } from '../types';
import AppHeader from '../components/AppHeader';

const RecipesScreen = () => {
  const { recipes, inventory, addRecipe, deleteRecipe } = useData();
  const { t } = useTranslation();
  const { theme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={t('navigation.recipes')} />

      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={openAddModal}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>+ {t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('common.noRecipes', { defaultValue: 'No recipes yet' })}
            </Text>
          </View>
        ) : (
          recipes.map(recipe => (
            <View key={recipe.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.recipeName, { color: theme.colors.text }]}>{recipe.name}</Text>
                  <Text style={[styles.recipeSku, { color: theme.colors.textSecondary }]}>{recipe.sku}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(recipe)}>
                  <Text style={[styles.deleteText, { color: theme.colors.error }]}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.yieldText, { color: theme.colors.text }]}>
                {t('common.yields', { defaultValue: 'Yields' })}: {recipe.yieldQuantity} {recipe.yieldUnit}
              </Text>

              <Text style={[styles.ingredientsTitle, { color: theme.colors.text }]}>{t('common.ingredients', { defaultValue: 'Ingredients' })}:</Text>
              {recipe.ingredients.map((ing, idx) => (
                <Text key={idx} style={[styles.ingredientText, { color: theme.colors.text }]}>
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
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.cancelText, { color: theme.colors.primary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('common.new')} {t('navigation.recipes')}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.saveText, { color: theme.colors.primary }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

           <ScrollView style={styles.modalContent}>
             <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.recipeName', { defaultValue: 'Recipe Name' })} *</Text>
             <TextInput
               style={[styles.input, {
                 backgroundColor: theme.colors.inputBackground,
                 borderColor: theme.colors.inputBorder,
                 color: theme.colors.text
               }]}
               value={formData.name}
               onChangeText={text => setFormData({ ...formData, name: text })}
               placeholder={t('common.recipeNamePlaceholder', { defaultValue: 'e.g., Burger Patty' })}
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

             <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.yieldQuantity', { defaultValue: 'Yield Quantity' })}</Text>
             <TextInput
               style={[styles.input, {
                 backgroundColor: theme.colors.inputBackground,
                 borderColor: theme.colors.inputBorder,
                 color: theme.colors.text
               }]}
                value={formData.yieldQuantity}
                onChangeText={text => setFormData({ ...formData, yieldQuantity: text })}
                keyboardType="numeric"
                placeholder={t('common.batchQuantityPlaceholder')}
                placeholderTextColor={theme.colors.inputPlaceholder}
             />

             <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.yieldUnit', { defaultValue: 'Yield Unit' })}</Text>
             <TextInput
               style={[styles.input, {
                 backgroundColor: theme.colors.inputBackground,
                 borderColor: theme.colors.inputBorder,
                 color: theme.colors.text
               }]}
               value={formData.yieldUnit}
               onChangeText={text => setFormData({ ...formData, yieldUnit: text })}
               placeholder={t('common.yieldUnitPlaceholder', { defaultValue: 'e.g., pieces, kg' })}
               placeholderTextColor={theme.colors.inputPlaceholder}
             />

             <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.addIngredients', { defaultValue: 'Add Ingredients' })}</Text>

             <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.selectIngredient', { defaultValue: 'Select Ingredient' })} *</Text>
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
                     currentIngredient.itemId === item.id && [styles.itemChipActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
                   ]}
                   onPress={() =>
                     setCurrentIngredient({ ...currentIngredient, itemId: item.id })
                   }
                 >
                   <Text
                     style={[
                       styles.itemChipText,
                       { color: theme.colors.text },
                       currentIngredient.itemId === item.id && [styles.itemChipTextActive, { color: theme.colors.surface }]
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
               value={currentIngredient.quantity}
                onChangeText={text =>
                  setCurrentIngredient({ ...currentIngredient, quantity: text })
                }
                keyboardType="numeric"
                placeholder={t('common.quantityPlaceholder')}
                placeholderTextColor={theme.colors.inputPlaceholder}
             />

             <TouchableOpacity style={[styles.addButton2, { backgroundColor: theme.colors.success }]} onPress={addIngredient}>
               <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>+ {t('common.addIngredient', { defaultValue: 'Add Ingredient' })}</Text>
             </TouchableOpacity>

             {ingredients.length > 0 && (
               <View style={[styles.ingredientsPreview, { backgroundColor: theme.colors.surface }]}>
                 <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.ingredientsAdded', { defaultValue: 'Ingredients Added' })}</Text>
                 {ingredients.map((ing, idx) => (
                   <Text key={idx} style={[styles.previewText, { color: theme.colors.text }]}>
                     • {ing.itemName} - {ing.quantity} {ing.unit}
                   </Text>
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
   },
   deleteText: {
     fontSize: 14,
     fontWeight: '600'
   },
   yieldText: {
     fontSize: 14,
     marginBottom: 12
   },
   ingredientsTitle: {
     fontSize: 14,
     fontWeight: '600',
     marginBottom: 8
   },
   ingredientText: {
     fontSize: 14,
     marginBottom: 4
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
     fontWeight: 'bold'
   },
   cancelText: {
     fontSize: 16
   },
   saveText: {
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
   addButton2: {
     padding: 12,
     borderRadius: 8,
     alignItems: 'center',
     marginBottom: 16
   },
   ingredientsPreview: {
     borderRadius: 8,
     padding: 12,
     marginBottom: 16
   },
   previewText: {
     fontSize: 14,
     marginBottom: 4
   }
});

export default RecipesScreen;
