package com.payflow.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("payments")
public class Payment {

    @PrimaryKey
    @Column("transaction_id")
    private UUID transactionId;

    @Column("sender_id")
    private String senderId;

    @Column("receiver_id")
    private String receiverId;

    @Column("amount")
    private BigDecimal amount;

    @Column("currency")
    private String currency;

    @Column("status")
    private String status;

    @Column("created_at")
    private Instant createdAt;

    @Column("region")
    private String region;
}
