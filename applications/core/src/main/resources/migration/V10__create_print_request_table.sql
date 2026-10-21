create table print_request
(
    id            uuid      not null primary key,
    created_at    timestamp not null,
    updated_at    timestamp not null,
    deleted_at    timestamp,
    version       bigint    not null default 1,
    submission_id uuid      not null,
    is_completed  boolean   not null default false,
    constraint fk_print_request_submission_id foreign key (submission_id) references submission (id)
);

create table print_request_aud
(
    rev              bigint    not null,
    revtype          smallint  not null,
    id               uuid      not null,
    created_at       timestamp not null,
    updated_at       timestamp not null,
    deleted_at       timestamp,
    deleted_at_mod   boolean   not null default false,
    version          bigint    not null default 1,
    submission_id    uuid      not null,
    is_completed     boolean   not null default false,
    is_completed_mod boolean   not null default false,
    primary key (rev, id),
    constraint fk_print_request_submission_id foreign key (submission_id) references submission (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);