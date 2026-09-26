create table attachment
(
    id           uuid      not null primary key,
    created_at   timestamp not null,
    updated_at   timestamp not null,
    deleted_at   timestamp,
    member_id    uuid      not null,
    filename     text      not null,
    content_type text      not null,
    context      text      not null,
    is_commited  boolean   not null default false,
    version      bigint    not null default 1,
    constraint fk_member_id foreign key (member_id) references member (id)
);

create table attachment_aud
(
    rev             bigint    not null,
    revtype         smallint  not null,
    id              uuid      not null,
    created_at      timestamp not null,
    updated_at      timestamp not null,
    deleted_at      timestamp,
    deleted_at_mod  boolean   not null default false,
    member_id       uuid      not null,
    filename        text      not null,
    content_type    text      not null,
    context         text      not null,
    is_commited     boolean   not null default false,
    is_commited_mod boolean   not null default false,
    version         bigint    not null,
    primary key (rev, id),
    constraint fk_rev foreign key (rev) references revinfo (rev),
    constraint fk_member_id foreign key (member_id) references member (id)
);
