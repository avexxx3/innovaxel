import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExpenses } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BottomTabInset } from '@/constants/theme';

export default function SummaryScreen() {
  const { expenses } = useExpenses();
  const theme = useTheme();

  // Calculate total spent
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group expenses by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  // Convert to array and sort by amount spent (highest first)
  const categoryBreakdown = Object.keys(categoryTotals).map((cat) => {
    const amount = categoryTotals[cat];
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    return {
      category: cat,
      amount,
      percentage,
    };
  }).sort((a, b) => b.amount - a.amount);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Summary</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: BottomTabInset + Spacing.five },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Spent Card */}
        <View style={[styles.totalCard, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Spent</Text>
          <Text style={[styles.totalAmount, { color: theme.text }]}>
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.totalCount, { color: theme.textSecondary }]}>
            Across {expenses.length} expense{expenses.length === 1 ? '' : 's'}
          </Text>
        </View>

        {/* Category Breakdown Heading */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Category Breakdown</Text>

        {categoryBreakdown.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No expense data available to display breakdown.
            </Text>
          </View>
        ) : (
          <View style={[styles.breakdownCard, { backgroundColor: theme.backgroundElement }]}>
            {categoryBreakdown.map((item, index) => {
              const color = getCategoryColor(item.category);
              return (
                <View key={item.category} style={[
                  styles.categoryRow,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128, 128, 128, 0.1)' }
                ]}>
                  {/* Top line of row: Title & Amount */}
                  <View style={styles.rowHeader}>
                    <View style={styles.categoryNameContainer}>
                      <View style={[styles.colorIndicator, { backgroundColor: color }]} />
                      <Text style={[styles.categoryName, { color: theme.text }]}>
                        {item.category}
                      </Text>
                    </View>
                    <View style={styles.amountContainer}>
                      <Text style={[styles.categoryAmount, { color: theme.text }]}>
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                      <Text style={[styles.categoryPercentage, { color: theme.textSecondary }]}>
                        ({item.percentage.toFixed(1)}%)
                      </Text>
                    </View>
                  </View>

                  {/* Visual Indicator: Progress Bar */}
                  <View style={[styles.progressBarTrack, { backgroundColor: theme.backgroundSelected }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: color,
                          width: `${item.percentage}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Category helper colors (must match index.tsx)
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContainer: {
    padding: Spacing.three,
  },
  totalCard: {
    borderRadius: Spacing.two,
    padding: Spacing.four,
    alignItems: 'center',
    marginBottom: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  totalCount: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  emptyContainer: {
    padding: Spacing.five,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  breakdownCard: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  categoryRow: {
    paddingVertical: Spacing.three,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.two,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: Spacing.one,
  },
  categoryPercentage: {
    fontSize: 12,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
