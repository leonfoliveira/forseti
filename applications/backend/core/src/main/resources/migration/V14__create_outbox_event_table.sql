create table outbox_event (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    status text not null,
    event_type text not null,
    payload jsonb not null,
    version bigint not null default 1
);

create index idx_outbox_event_status on outbox_event (status);
create index idx_outbox_event_event_type on outbox_event (event_type);

create table outbox_event_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    status text not null,
    status_mod boolean not null default false,
    event_type text not null,
    payload jsonb not null,
    version bigint not null,
    primary key (rev, id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);