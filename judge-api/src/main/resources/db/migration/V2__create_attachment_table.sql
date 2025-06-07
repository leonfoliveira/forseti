create table attachment (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    filename text not null,
    content_type text not null
);

create table attachment_aud (
    rev int not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    created_at_mod boolean not null default false,
    updated_at timestamp not null,
    updated_at_mod boolean not null default false,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    filename text not null,
    filename_mod boolean not null default false,
    content_type text not null,
    content_type_mod boolean not null default false,
    primary key (rev, id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
