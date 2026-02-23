create table execution (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    submission_id uuid not null,
    answer text not null,
    total_test_cases integer not null,
    approved_test_cases integer not null,
    input_id uuid not null,
    output_id uuid not null,
    version bigint not null default 1,
    constraint fk_submission_id foreign key (submission_id) references submission (id),
    constraint fk_input_id foreign key (input_id) references attachment (id),
    constraint fk_output_id foreign key (output_id) references attachment (id),
    constraint chk_total_test_cases_positive check (total_test_cases > 0),
    constraint chk_approved_test_cases_non_negative check (approved_test_cases >= 0),
    constraint chk_approved_test_cases_less_equal_total check (approved_test_cases <= total_test_cases)
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
    approved_test_cases integer not null,
    input_id uuid not null,
    output_id uuid not null,
    version bigint not null,
    primary key (rev, id),
    constraint fk_submission_id foreign key (submission_id) references submission (id),
    constraint fk_input_id foreign key (input_id) references attachment (id),
    constraint fk_output_id foreign key (output_id) references attachment (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
