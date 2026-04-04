create table business_event (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    status text not null,
    type text not null,
    payload jsonb not null
);