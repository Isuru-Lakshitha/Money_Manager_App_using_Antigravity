-- Futuristic Money Manager - Supabase SQL Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CATEGORIES TABLE
create table categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ACCOUNTS TABLE
create table accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('cash', 'bank', 'mobile', 'credit')),
  balance numeric(12, 2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS TABLE
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('income', 'expense', 'transfer', 'loan_payment')),
  amount numeric(12, 2) not null check (amount > 0),
  fee_amount numeric(12, 2) default 0 check (fee_amount >= 0),
  account_id uuid references accounts(id) on delete cascade not null,
  to_account_id uuid references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  loan_id uuid references loans(id) on delete set null,
  date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure to_account_id is required only for transfers
  check (
    (type = 'transfer' and to_account_id is not null) or
    (type != 'transfer' and to_account_id is null)
  )
);

-- GOALS TABLE
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TAGS TABLE
create table tags (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, name)
);

-- LOANS TABLE
create table loans (
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
create table loan_payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  loan_id uuid references loans(id) on delete cascade not null,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BUDGETS TABLE
create table budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  amount numeric(12, 2) not null check (amount > 0),
  month text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, category_id, month)
);

-- RECURRING_TRANSACTIONS TABLE
create table recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense', 'transfer')),
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete cascade not null,
  to_account_id uuid references accounts(id) on delete cascade,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_date date not null default current_date,
  notes text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (type = 'transfer' and to_account_id is not null) or
    (type != 'transfer' and to_account_id is null)
  )
);

-- TRANSACTION_TAGS (Many-to-Many join table)
create table transaction_tags (
  transaction_id uuid references transactions(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  primary key (transaction_id, tag_id)
);

-- RLS (Row Level Security) POLICIES
alter table categories enable row level security;
alter table transactions enable row level security;
alter table accounts enable row level security;
alter table goals enable row level security;
alter table tags enable row level security;
alter table transaction_tags enable row level security;
alter table loans enable row level security;
alter table loan_payments enable row level security;
alter table budgets enable row level security;
alter table recurring_transactions enable row level security;

-- Policies for Categories
create policy "Users can view their own categories" on categories for select using (auth.uid() = user_id);
create policy "Users can insert their own categories" on categories for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories" on categories for update using (auth.uid() = user_id);
create policy "Users can delete their own categories" on categories for delete using (auth.uid() = user_id);

-- Policies for Transactions
create policy "Users can view their own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own transactions" on transactions for delete using (auth.uid() = user_id);

-- Policies for Accounts
create policy "Users can view their own accounts" on accounts for select using (auth.uid() = user_id);
create policy "Users can insert their own accounts" on accounts for insert with check (auth.uid() = user_id);
create policy "Users can update their own accounts" on accounts for update using (auth.uid() = user_id);
create policy "Users can delete their own accounts" on accounts for delete using (auth.uid() = user_id);

-- Policies for Goals
create policy "Users can view their own goals" on goals for select using (auth.uid() = user_id);
create policy "Users can insert their own goals" on goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own goals" on goals for update using (auth.uid() = user_id);
create policy "Users can delete their own goals" on goals for delete using (auth.uid() = user_id);

-- Policies for Tags
create policy "Users can view their own tags" on tags for select using (auth.uid() = user_id);
create policy "Users can insert their own tags" on tags for insert with check (auth.uid() = user_id);
create policy "Users can delete their own tags" on tags for delete using (auth.uid() = user_id);

-- Policies for Transaction_Tags
create policy "Users can view transaction tags for their transactions" on transaction_tags for select 
using (exists (select 1 from transactions where transactions.id = transaction_tags.transaction_id and transactions.user_id = auth.uid()));

create policy "Users can insert transaction tags for their transactions" on transaction_tags for insert 
with check (exists (select 1 from transactions where transactions.id = transaction_tags.transaction_id and transactions.user_id = auth.uid()));

create policy "Users can delete transaction tags for their transactions" on transaction_tags for delete
using (exists (select 1 from transactions where transactions.id = transaction_tags.transaction_id and transactions.user_id = auth.uid()));

-- Policies for Loans
create policy "Users can view their own loans" on loans for select using (auth.uid() = user_id);
create policy "Users can insert their own loans" on loans for insert with check (auth.uid() = user_id);
create policy "Users can update their own loans" on loans for update using (auth.uid() = user_id);
create policy "Users can delete their own loans" on loans for delete using (auth.uid() = user_id);

-- Policies for Loan Payments
create policy "Users can view their own loan payments" on loan_payments for select using (auth.uid() = user_id);
create policy "Users can insert their own loan payments" on loan_payments for insert with check (auth.uid() = user_id);
create policy "Users can update their own loan payments" on loan_payments for update using (auth.uid() = user_id);
create policy "Users can delete their own loan payments" on loan_payments for delete using (auth.uid() = user_id);

-- Policies for Budgets
create policy "Users can view their own budgets" on budgets for select using (auth.uid() = user_id);
create policy "Users can insert their own budgets" on budgets for insert with check (auth.uid() = user_id);
create policy "Users can update their own budgets" on budgets for update using (auth.uid() = user_id);
create policy "Users can delete their own budgets" on budgets for delete using (auth.uid() = user_id);

-- Policies for Recurring Transactions
create policy "Users can view their own recurring transactions" on recurring_transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own recurring transactions" on recurring_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own recurring transactions" on recurring_transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own recurring transactions" on recurring_transactions for delete using (auth.uid() = user_id);

-- USER_SETTINGS TABLE
create table user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  base_currency text not null default 'LKR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table user_settings enable row level security;
create policy "Users can view their own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert their own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update their own settings" on user_settings for update using (auth.uid() = user_id);

