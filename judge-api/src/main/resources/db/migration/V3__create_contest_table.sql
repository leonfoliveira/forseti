create table contest (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    title text not null,
    slug text not null unique,
    languages text[] not null,
    start_at timestamp not null,
    end_at timestamp not null
);

create table contest_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    updated_at_mod boolean not null default false,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    title text not null,
    title_mod boolean not null default false,
    slug text not null,
    slug_mod boolean not null default false,
    languages text[] not null,
    languages_mod boolean not null default false,
    start_at timestamp not null,
    start_at_mod boolean not null default false,
    end_at timestamp not null,
    end_at_mod boolean not null default false,
    primary key (rev, id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
