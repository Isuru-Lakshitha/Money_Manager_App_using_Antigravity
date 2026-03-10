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
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric(12, 2) not null check (amount > 0),
  fee_amount numeric(12, 2) default 0 check (fee_amount >= 0),
  account_id uuid references accounts(id) on delete cascade not null,
  to_account_id uuid references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
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
