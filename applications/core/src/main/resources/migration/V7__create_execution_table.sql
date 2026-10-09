create table execution
(
    id                  uuid      not null primary key,
    created_at          timestamp not null,
    updated_at          timestamp not null,
    deleted_at          timestamp,
    version             bigint    not null default 1,
    submission_id       uuid      not null,
    answer              text      not null,
    total_test_cases    integer   not null,
    approved_test_cases integer   not null,
    max_cpu_time_ms     bigint,
    max_clock_time_ms   bigint,
    max_peak_memory_kb  bigint,
    details_id          uuid,
    constraint fk_submission_id foreign key (submission_id) references submission (id),
    constraint fk_details_id foreign key (details_id) references attachment (id)
);

create index idx_execution_submission_id on execution (submission_id);

create table execution_aud
(
    rev                 bigint    not null,
    revtype             smallint  not null,
    id                  uuid      not null,
    created_at          timestamp not null,
    updated_at          timestamp not null,
    deleted_at          timestamp,
    deleted_at_mod      boolean   not null default false,
    version             bigint    not null default 1,
    submission_id       uuid      not null,
    answer              text      not null,
    total_test_cases    integer   not null,
    approved_test_cases integer   not null,
    max_cpu_time_ms     bigint,
    max_clock_time_ms   bigint,
    max_peak_memory_kb  bigint,
    details_id          uuid,
    primary key (rev, id),
    constraint fk_submission_id foreign key (submission_id) references submission (id),
    constraint fk_details_id foreign key (details_id) references attachment (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);