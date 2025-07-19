create table execution (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    submission_id uuid not null,
    answer text not null,
    total_test_cases integer not null,
    last_test_case integer not null,
    input_id uuid not null,
    output_id uuid not null,
    constraint fk_submission_id foreign key (submission_id) references submission (id),
    constraint fk_input_id foreign key (input_id) references attachment (id),
    constraint fk_output_id foreign key (output_id) references attachment (id)
);

create index idx_execution_submission_id on execution (submission_id);

create table execution_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    submission_id uuid not null,
    answer text not null,
    total_test_cases integer not null,
    last_test_case integer not null,
    input_id uuid not null,
    output_id uuid not null,
    primary key (rev, id),
    constraint fk_submission_id foreign key (submission_id) references submission (id),
    constraint fk_input_id foreign key (input_id) references attachment (id),
    constraint fk_output_id foreign key (output_id) references attachment (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
