create table member (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id uuid not null,
    type text not null,
    name text not null,
    login text not null,
    password text not null,
    constraint fk_contest_id foreign key (contest_id) references contest (id)
);

create unique index uq_idx_member_login_contest on member (login, contest_id);
create index idx_member_contest_id on member (contest_id);
create index idx_member_login on member (login);

create table member_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    updated_at_mod boolean not null default false,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    contest_id uuid not null,
    type text not null,
    type_mod boolean not null default false,
    name text not null,
    name_mod boolean not null default false,
    login text not null,
    login_mod boolean not null default false,
    password text not null,
    password_mod boolean not null default false,
    primary key (rev, id),
    constraint fk_contest_id foreign key (contest_id) references contest (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
