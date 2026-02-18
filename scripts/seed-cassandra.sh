#!/bin/bash
# Seeds the Cassandra database with the payflow schema and sample transactions.
# Usage: ./scripts/seed-cassandra.sh [cassandra-host] [cassandra-port]
# Defaults: host=localhost, port=9042

CASSANDRA_HOST=${1:-localhost}
CASSANDRA_PORT=${2:-9042}

echo "Waiting for Cassandra to be ready at $CASSANDRA_HOST:$CASSANDRA_PORT..."
until cqlsh "$CASSANDRA_HOST" "$CASSANDRA_PORT" -e "describe keyspaces" > /dev/null 2>&1; do
  sleep 5
  echo "Still waiting for Cassandra..."
done
echo "Cassandra is ready."

echo "Creating keyspace and schema..."
cqlsh "$CASSANDRA_HOST" "$CASSANDRA_PORT" <<'CQL'
-- Create keyspace
CREATE KEYSPACE IF NOT EXISTS payflow WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE payflow;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  transaction_id UUID PRIMARY KEY,
  sender_id      TEXT,
  receiver_id    TEXT,
  amount         DECIMAL,
  currency       TEXT,
  status         TEXT,
  created_at     TIMESTAMP,
  region         TEXT
);

-- Secondary indexes
CREATE INDEX IF NOT EXISTS payments_sender_id_idx ON payments (sender_id);
CREATE INDEX IF NOT EXISTS payments_status_idx    ON payments (status);
CQL

echo "Schema created."

echo "Seeding sample transactions..."
cqlsh "$CASSANDRA_HOST" "$CASSANDRA_PORT" <<'CQL'
USE payflow;

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_001', 'merchant_001', 125.50, 'USD', 'COMPLETED', toTimestamp(now()), 'us-east');

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_002', 'merchant_002', 89.99, 'EUR', 'COMPLETED', toTimestamp(now()), 'eu-west');

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_001', 'merchant_003', 450.00, 'USD', 'PENDING', toTimestamp(now()), 'us-west');

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_003', 'merchant_001', 30.00, 'GBP', 'FAILED', toTimestamp(now()), 'eu-west');

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_004', 'merchant_004', 200.00, 'USD', 'COMPLETED', toTimestamp(now()), 'us-east');

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_002', 'merchant_005', 750.00, 'USD', 'PENDING', toTimestamp(now()), 'us-west');

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_005', 'merchant_001', 55.25, 'EUR', 'COMPLETED', toTimestamp(now()), 'eu-west');

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_003', 'merchant_002', 1200.00, 'USD', 'COMPLETED', toTimestamp(now()), 'us-east');

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_006', 'merchant_003', 15.99, 'GBP', 'FAILED', toTimestamp(now()), 'eu-west');

INSERT INTO payments (transaction_id, sender_id, receiver_id, amount, currency, status, created_at, region)
VALUES (uuid(), 'user_007', 'merchant_004', 320.00, 'USD', 'PENDING', toTimestamp(now()), 'us-east');
CQL

echo "Seed complete. 10 sample transactions inserted."
