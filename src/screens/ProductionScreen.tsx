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
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';

const ProductionScreen = () => {
  const navigation = useNavigation();
  const { productions, recipes, addProduction } = useData();
  const { t } = useTranslation();
  const { theme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={t('navigation.production')} />

      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={openAddModal}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>+ {t('common.new')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {productions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('common.noProduction', { defaultValue: 'No production batches yet' })}
            </Text>
          </View>
        ) : (
          productions.map(prod => (
            <View key={prod.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.recipeName, { color: theme.colors.text }]}>{prod.recipeName}</Text>
              <Text style={[styles.quantity, { color: theme.colors.text }]}>
                {t('common.quantity')}: {prod.quantity} {t('common.batches', { defaultValue: 'batches' })}
              </Text>
              <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{prod.date}</Text>
              {prod.notes && <Text style={[styles.notes, { color: theme.colors.textSecondary }]}>{t('common.notes')}: {prod.notes}</Text>}
            </View>
          ))
        )}
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Sales' as never)}
        >
          <Text style={[styles.navButtonText, { color: theme.colors.text }]}>💰 {t('navigation.sales')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Expenses' as never)}
        >
          <Text style={[styles.navButtonText, { color: theme.colors.text }]}>💳 {t('navigation.expenses')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Reports' as never)}
        >
          <Text style={[styles.navButtonText, { color: theme.colors.text }]}>📊 {t('navigation.reports')}</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('common.new')} {t('navigation.production')}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.saveText, { color: theme.colors.primary }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.selectRecipe', { defaultValue: 'Select Recipe' })} *</Text>
            {recipes.map(recipe => (
              <TouchableOpacity
                key={recipe.id}
                style={[
                  styles.recipeCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  selectedRecipeId === recipe.id && [styles.recipeCardActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
                ]}
                onPress={() => setSelectedRecipeId(recipe.id)}
              >
                <Text style={[styles.recipeCardName, { color: selectedRecipeId === recipe.id ? theme.colors.surface : theme.colors.text }]}>{recipe.name}</Text>
                <Text style={[styles.recipeCardYield, { color: selectedRecipeId === recipe.id ? theme.colors.surface : theme.colors.textSecondary }]}>
                  {t('common.yields', { defaultValue: 'Yields' })}: {recipe.yieldQuantity} {recipe.yieldUnit}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.numberOfBatches', { defaultValue: 'Number of Batches' })} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder={t('common.batchQuantityPlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

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

             <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.notes')}</Text>
             <TextInput
               style={[styles.input, styles.textArea, {
                 backgroundColor: theme.colors.inputBackground,
                 borderColor: theme.colors.inputBorder,
                 color: theme.colors.text
               }]}
               value={notes}
               onChangeText={setNotes}
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
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  quantity: {
    fontSize: 14,
    marginBottom: 4
  },
  date: {
    fontSize: 12,
    marginBottom: 4
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic'
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
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
  recipeCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
  },
  recipeCardActive: {},
  recipeCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  recipeCardYield: {
    fontSize: 12,
  }
});

export default ProductionScreen;
