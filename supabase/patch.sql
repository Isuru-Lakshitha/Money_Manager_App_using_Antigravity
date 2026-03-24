-- LOANS TABLE
create table if not exists loans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  principal_amount numeric(12, 2) not null check (principal_amount > 0),
  annual_interest_rate numeric(5, 2) not null check (annual_interest_rate >= 0),
  start_date date not null default current_date,
  status text not null default 'active' check (status in ('active', 'paid_off')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LOAN_PAYMENTS TABLE
create table if not exists loan_payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  loan_id uuid references loans(id) on delete cascade not null,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BUDGETS TABLE
create table if not exists budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  amount numeric(12, 2) not null check (amount > 0),
  month text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, category_id, month)
);

-- UPDATE TRANSACTIONS TABLE
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type in ('income', 'expense', 'transfer', 'loan_payment'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS loan_id uuid references loans(id) on delete set null;

-- RLS
alter table loans enable row level security;
alter table loan_payments enable row level security;
alter table budgets enable row level security;

-- Policies (We use DO block to gracefully catch "already exists")
DO $$
BEGIN
    BEGIN
        create policy "Users can view their own loans" on loans for select using (auth.uid() = user_id);
        create policy "Users can insert their own loans" on loans for insert with check (auth.uid() = user_id);
        create policy "Users can update their own loans" on loans for update using (auth.uid() = user_id);
        create policy "Users can delete their own loans" on loans for delete using (auth.uid() = user_id);

        create policy "Users can view their own loan payments" on loan_payments for select using (auth.uid() = user_id);
        create policy "Users can insert their own loan payments" on loan_payments for insert with check (auth.uid() = user_id);
        create policy "Users can update their own loan payments" on loan_payments for update using (auth.uid() = user_id);
        create policy "Users can delete their own loan payments" on loan_payments for delete using (auth.uid() = user_id);

        create policy "Users can view their own budgets" on budgets for select using (auth.uid() = user_id);
        create policy "Users can insert their own budgets" on budgets for insert with check (auth.uid() = user_id);
        create policy "Users can update their own budgets" on budgets for update using (auth.uid() = user_id);
        create policy "Users can delete their own budgets" on budgets for delete using (auth.uid() = user_id);
    EXCEPTION
        WHEN duplicate_object THEN null;
    END;
END $$;
