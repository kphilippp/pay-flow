CREATE TABLE IF NOT EXISTS payflow.expenses (
    id UUID PRIMARY KEY,
    paid_by TEXT,
    total_amount DOUBLE,
    description TEXT,
    split_with LIST<TEXT>,
    status TEXT,
    created_at TIMESTAMP
);
