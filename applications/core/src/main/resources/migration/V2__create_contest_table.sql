create table contest
(
    id             uuid      not null primary key,
    created_at     timestamp not null,
    updated_at     timestamp not null,
    deleted_at     timestamp,
    version        bigint    not null default 1,
    slug           text      not null unique,
    title          text      not null,    
    languages      text[] not null,
    start_at       timestamp not null,
    end_at         timestamp not null,
    auto_freeze_at timestamp,
    frozen_at      timestamp,
    unfrozen_at    timestamp,
    ip_cidrs       text[] not null
);

create unique index idx_contest_slug_unique_active on contest (slug) where deleted_at is null;

create table contest_aud
(
    rev                bigint    not null,
    revtype            smallint  not null,
    id                 uuid      not null,
    created_at         timestamp not null,
    updated_at         timestamp not null,
    deleted_at         timestamp,
    deleted_at_mod     boolean   not null default false,
    version            bigint    not null,
    slug               text      not null,
    slug_mod           boolean   not null default false,
    title              text      not null,
    title_mod          boolean   not null default false,    
    languages          text[] not null,
    languages_mod      boolean   not null default false,
    start_at           timestamp not null,
    start_at_mod       boolean   not null default false,
    end_at             timestamp not null,
    end_at_mod         boolean   not null default false,
    auto_freeze_at     timestamp,
    auto_freeze_at_mod boolean   not null default false,
    frozen_at          timestamp,
    frozen_at_mod      boolean   not null default false,
    unfrozen_at        timestamp,
    unfrozen_at_mod    boolean   not null default false,
    ip_cidrs           text[]    not null,
    ip_cidrs_mod       boolean   not null default false,
    primary key (rev, id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
