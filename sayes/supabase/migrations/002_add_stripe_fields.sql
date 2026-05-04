-- usersテーブルにStripe・プランカラムを追加
alter table users
  add column if not exists plan text not null default 'free',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

create index if not exists users_stripe_customer_id_idx on users(stripe_customer_id);
