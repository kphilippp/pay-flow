package com.payflow.service;

import com.payflow.model.Expense;
import com.payflow.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public Expense create(Expense expense) {
        expense.setId(UUID.randomUUID());
        expense.setStatus("PENDING");
        expense.setCreatedAt(Instant.now());
        return expenseRepository.save(expense);
    }

    public Expense findById(UUID id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    public List<Expense> findByUser(String userId) {
        List<Expense> allExpenses = expenseRepository.findAll();
        return allExpenses.stream()
                .filter(e -> userId.equals(e.getPaidBy()) ||
                        (e.getSplitWith() != null && e.getSplitWith().contains(userId)))
                .collect(Collectors.toList());
    }

    public Map<String, Double> getBalanceForUser(String userId) {
        List<Expense> expenses = findByUser(userId);
        Map<String, Double> balances = new HashMap<>();

        for (Expense expense : expenses) {
            if (!"PENDING".equals(expense.getStatus())) continue;

            List<String> splitWith = expense.getSplitWith();
            if (splitWith == null || splitWith.isEmpty()) continue;

            double share = expense.getTotalAmount() / splitWith.size();

            if (userId.equals(expense.getPaidBy())) {
                // Others owe the current user
                for (String person : splitWith) {
                    if (!person.equals(userId)) {
                        balances.merge(person, share, Double::sum);
                    }
                }
            } else if (splitWith.contains(userId)) {
                // Current user owes the payer
                String payer = expense.getPaidBy();
                balances.merge(payer, -share, Double::sum);
            }
        }

        return balances;
    }

    public Expense settle(UUID id) {
        Expense expense = findById(id);
        expense.setStatus("SETTLED");
        return expenseRepository.save(expense);
    }
}
