create table problem (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id uuid not null,
    letter char not null,
    title text not null,
    description_id uuid not null,
    time_limit int not null,
    test_cases_id uuid not null,
    constraint fk_contest_id foreign key (contest_id) references contest (id),
    constraint fk_description_id foreign key (description_id) references attachment (id),
    constraint fk_test_cases_id foreign key (test_cases_id) references attachment (id)
);

create index idx_problem_contest_id on problem (contest_id);

create table problem_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    updated_at_mod boolean not null default false,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    contest_id uuid not null,
    letter char not null,
    letter_mod boolean not null default false,
    title text not null,
    title_mod boolean not null default false,
    description_id uuid not null,
    description_id_mod boolean not null default false,
    time_limit int not null,
    time_limit_mod boolean not null default false,
    test_cases_id uuid not null,
    test_cases_id_mod boolean not null default false,
    primary key (rev, id),
    constraint fk_contest_id foreign key (contest_id) references contest (id),
    constraint fk_description_id foreign key (description_id) references attachment (id),
    constraint fk_test_cases_id foreign key (test_cases_id) references attachment (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
