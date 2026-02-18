package com.payflow.service;

import com.payflow.model.Expense;
import com.payflow.repository.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private ExpenseService expenseService;

    @Test
    void create_SetsIdAndStatusAndCreatedAt() {
        Expense input = Expense.builder()
                .paidBy("kevin")
                .totalAmount(60.0)
                .description("Dinner")
                .splitWith(List.of("kevin", "alex", "priya"))
                .build();

        when(expenseRepository.save(any(Expense.class))).thenAnswer(inv -> inv.getArgument(0));

        Expense result = expenseService.create(input);

        assertThat(result.getId()).isNotNull();
        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getCreatedAt()).isBeforeOrEqualTo(Instant.now());
    }

    @Test
    void getBalanceForUser_AsPayerCalculatesCorrectOwed() {
        UUID id = UUID.randomUUID();
        Expense expense = Expense.builder()
                .id(id)
                .paidBy("kevin")
                .totalAmount(60.0)
                .description("Dinner")
                .splitWith(List.of("kevin", "alex", "priya"))
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        when(expenseRepository.findAll()).thenReturn(List.of(expense));

        Map<String, Double> balances = expenseService.getBalanceForUser("kevin");

        // kevin paid $60, split 3 ways = $20 each. alex and priya each owe kevin $20
        assertThat(balances).containsEntry("alex", 20.0);
        assertThat(balances).containsEntry("priya", 20.0);
        assertThat(balances).doesNotContainKey("kevin");
    }

    @Test
    void getBalanceForUser_AsOweeCalculatesNegativeBalance() {
        UUID id = UUID.randomUUID();
        Expense expense = Expense.builder()
                .id(id)
                .paidBy("kevin")
                .totalAmount(60.0)
                .description("Dinner")
                .splitWith(List.of("kevin", "alex", "priya"))
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        when(expenseRepository.findAll()).thenReturn(List.of(expense));

        Map<String, Double> balances = expenseService.getBalanceForUser("alex");

        // alex owes kevin $20 (negative = alex owes)
        assertThat(balances).containsEntry("kevin", -20.0);
        assertThat(balances).doesNotContainKey("alex");
    }

    @Test
    void settle_ChangesStatusToSettled() {
        UUID id = UUID.randomUUID();
        Expense expense = Expense.builder()
                .id(id)
                .paidBy("kevin")
                .totalAmount(60.0)
                .description("Dinner")
                .splitWith(List.of("kevin", "alex"))
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        when(expenseRepository.findById(id)).thenReturn(Optional.of(expense));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(inv -> inv.getArgument(0));

        Expense result = expenseService.settle(id);

        assertThat(result.getStatus()).isEqualTo("SETTLED");
    }
}
