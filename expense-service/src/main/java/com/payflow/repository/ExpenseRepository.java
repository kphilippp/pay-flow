package com.payflow.repository;

import com.payflow.model.Expense;
import org.springframework.data.cassandra.repository.AllowFiltering;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends CassandraRepository<Expense, UUID> {

    @AllowFiltering
    List<Expense> findAllByPaidBy(String paidBy);
}
