import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import { spacing, borderRadius, fontSize, fontWeight, componentStyles, layout } from '../themes/designTokens';

const ExpensesScreen = () => {
  const { expenses, addExpense } = useData();
  const { t } = useTranslation();
  const { theme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={t('navigation.expenses')} />

      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={openAddModal}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>+ {t('common.add')}</Text>
        </TouchableOpacity>
      </View>

       <View style={[styles.statsBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
         <Text style={[styles.statsText, { color: theme.colors.error }]}>
           {t('common.total')}: ${totalExpenses.toFixed(2)}
         </Text>
         <Text style={[styles.statsText, { color: theme.colors.text }]}>
           {t('common.count', { defaultValue: 'Count' })}: {expenses.length}
         </Text>
       </View>

      <ScrollView style={styles.content}>
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('common.noExpenses', { defaultValue: 'No expenses yet' })}
            </Text>
          </View>
        ) : (
          expenses.map(expense => (
            <View key={expense.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.description, { color: theme.colors.text }]}>{expense.description}</Text>
                  <Text style={[styles.category, { color: theme.colors.textSecondary }]}>{expense.category}</Text>
                </View>
                <Text style={[styles.amount, { color: theme.colors.error }]}>${expense.amount.toFixed(2)}</Text>
              </View>

              <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{expense.date}</Text>
              {expense.notes && (
                <Text style={[styles.notes, { color: theme.colors.textSecondary }]}>{t('common.notes')}: {expense.notes}</Text>
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
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('common.add')} {t('navigation.expenses')}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.saveText, { color: theme.colors.primary }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.category', { defaultValue: 'Category' })} *</Text>
            <View style={styles.categoryGrid}>
              {['Office Supplies', 'Utilities', 'Marketing', 'Travel', 'Equipment', 'Software', 'Other'].map(cat => (
                <View key={cat} style={styles.categoryGridItem}>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border
                      },
                      formData.category === cat && [styles.categoryChipActive, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: theme.colors.textSecondary },
                        formData.category === cat && [styles.categoryChipTextActive, { color: theme.colors.surface }]
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.description')} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.description}
              onChangeText={text => setFormData({ ...formData, description: text })}
              placeholder={t('common.descriptionPlaceholder', { defaultValue: 'e.g., Monthly rent' })}
              placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.amount')} *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.amount}
              onChangeText={text => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
              placeholder={t('common.amountPlaceholder')}
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

            <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.notes')}</Text>
            <TextInput
              style={[styles.input, styles.textArea, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }]}
              value={formData.notes}
              onChangeText={text => setFormData({ ...formData, notes: text })}
              placeholder={t('common.additionalNotes')}
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
    padding: layout.screenPadding,
    paddingTop: 0,
  },
  addButton: {
    ...componentStyles.button,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  statsBar: {
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
  },
  statsText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: layout.screenPadding,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
  },
  card: {
    ...componentStyles.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: fontSize.xs,
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  date: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  notes: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    ...componentStyles.header,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  cancelText: {
    fontSize: fontSize.md,
  },
  saveText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  modalContent: {
    flex: 1,
    padding: layout.screenPadding,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    ...componentStyles.input,
    marginBottom: spacing.lg,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  categoryGridItem: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  categoryChipActive: {},
  categoryChipText: {
    fontSize: fontSize.sm,
  },
  categoryChipTextActive: {
    fontWeight: fontWeight.semibold,
  },
});

export default ExpensesScreen;
