create table session (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    member_id uuid not null,
    expires_at timestamp not null,
    constraint fk_member_id foreign key (member_id) references member (id)
);

create index idx_session_member_id on session (member_id);

create table session_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    member_id uuid not null,
    expires_at timestamp not null,
    primary key (rev, id),
    constraint fk_member_id_aud foreign key (member_id) references member (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
