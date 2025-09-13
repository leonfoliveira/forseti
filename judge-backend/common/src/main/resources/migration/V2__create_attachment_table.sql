create table attachment (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id uuid not null,
    member_id uuid,
    filename text not null,
    content_type text not null,
    context text not null
);

create table attachment_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    contest_id uuid not null,
    member_id uuid,
    filename text not null,
    content_type text not null,
    context text not null,
    primary key (rev, id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
