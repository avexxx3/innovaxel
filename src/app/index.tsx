import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExpenses, Expense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BottomTabInset } from '@/constants/theme';

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'];

export default function HomeScreen() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const theme = useTheme();

  // Form states
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // Get current date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenAddModal = () => {
    setEditMode(false);
    setSelectedExpenseId(null);
    setTitle('');
    setAmount('');
    setCategory('Food');
    setDate(getTodayDateString());
    setNotes('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditMode(true);
    setSelectedExpenseId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date);
    setNotes(expense.notes || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Basic validation
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0');
      return;
    }

    // Simple date regex check (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Validation Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    const expenseData = {
      title: title.trim(),
      amount: numericAmount,
      category,
      date,
      notes: notes.trim() || undefined,
    };

    try {
      if (editMode && selectedExpenseId) {
        await updateExpense(selectedExpenseId, expenseData);
      } else {
        await addExpense(expenseData);
      }
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Could not save the expense');
    }
  };

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expense.id);
            } catch {
              Alert.alert('Error', 'Could not delete the expense');
            }
          },
        },
      ]
    );
  };

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    return (
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Text style={[styles.cardAmount, { color: theme.text }]}>
            ${item.amount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.cardSubheader}>
          <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>
            {item.category} • {item.date}
          </Text>
        </View>

        {item.notes ? (
          <Text style={[styles.cardNotes, { color: theme.textSecondary }]}>
            {item.notes}
          </Text>
        ) : null}

        <View style={styles.cardActions}>
          <Pressable
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleOpenEditModal(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Expenses</Text>
        <Pressable style={styles.addButton} onPress={handleOpenAddModal}>
          <Text style={styles.addButtonText}>+ Add New</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: theme.textSecondary }}>Loading expenses...</Text>
        </View>
      ) : sortedExpenses.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.noExpensesText, { color: theme.textSecondary }]}>
            {"No expenses found.\nTap \"+ Add New\" to start tracking."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: BottomTabInset + Spacing.five },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editMode ? 'Edit Expense' : 'Add Expense'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeModalButton}>
                <Text style={{ color: theme.textSecondary, fontSize: 18 }}>Close</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
                placeholder="e.g. Dinner with friends"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.label, { color: theme.text }]}>Amount ($) *</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
                placeholder="e.g. 2200"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
              <View style={styles.chipsContainer}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? '#208AEF' : theme.backgroundElement,
                          borderColor: theme.backgroundSelected,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#ffffff' : theme.text },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
                value={date}
                onChangeText={setDate}
              />

              <Text style={[styles.label, { color: theme.text }]}>Notes (Optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
                ]}
                placeholder="e.g. Pizza night with office team"
                placeholderTextColor={theme.textSecondary}
                multiline={true}
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />

              <View style={styles.formActions}>
                <Pressable
                  style={[styles.formButton, styles.cancelButton, { borderColor: theme.backgroundSelected }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.formButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Colors for category indicator dots
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Food':
      return '#FF6B6B';
    case 'Transport':
      return '#4D96FF';
    case 'Utilities':
      return '#6BCB77';
    case 'Entertainment':
      return '#FFD93D';
    case 'Health':
      return '#9B5DE5';
    case 'Shopping':
      return '#F15BB5';
    default:
      return '#8D99AE';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  noExpensesText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  listContainer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.two,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubheader: {
    marginTop: Spacing.one,
  },
  cardMeta: {
    fontSize: 12,
  },
  cardNotes: {
    marginTop: Spacing.two,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.1)',
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  actionButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
  },
  editButton: {
    backgroundColor: 'rgba(32, 138, 239, 0.1)',
  },
  editButtonText: {
    color: '#208AEF',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 13,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    maxHeight: '90%',
    paddingBottom: Spacing.five,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeModalButton: {
    padding: Spacing.one,
  },
  form: {
    padding: Spacing.three,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.one,
    marginTop: Spacing.two,
  },
  input: {
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: Spacing.two,
  },
  textArea: {
    height: 80,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  formButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#208AEF',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});
