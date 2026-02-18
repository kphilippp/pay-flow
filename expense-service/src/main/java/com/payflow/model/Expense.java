package com.payflow.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Table("expenses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @PrimaryKey
    private UUID id;

    @Column("paid_by")
    private String paidBy;

    @Column("total_amount")
    private Double totalAmount;

    @Column("description")
    private String description;

    @Column("split_with")
    private List<String> splitWith;

    @Column("status")
    private String status;

    @Column("created_at")
    private Instant createdAt;
}
