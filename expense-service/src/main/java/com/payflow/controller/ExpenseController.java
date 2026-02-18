package com.payflow.controller;

import com.payflow.model.Expense;
import com.payflow.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.create(expense));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpense(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Expense>> getByUser(@PathVariable String userId) {
        return ResponseEntity.ok(expenseService.findByUser(userId));
    }

    @GetMapping("/balance/{userId}")
    public ResponseEntity<Map<String, Double>> getBalance(@PathVariable String userId) {
        return ResponseEntity.ok(expenseService.getBalanceForUser(userId));
    }

    @PutMapping("/{id}/settle")
    public ResponseEntity<Expense> settle(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.settle(id));
    }
}
