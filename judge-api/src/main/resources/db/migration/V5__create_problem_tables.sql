create table problem (
    id serial primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id int not null,
    title text not null,
    description_key uuid not null,
    time_limit int not null,
    test_cases_key uuid not null,
    constraint fk_contest foreign key (contest_id) references contest (id),
    constraint fk_test_cases_key foreign key (test_cases_key) references attachment (key)
);

create table problem_aud (
    rev int not null,
    revtype smallint not null,
    id int not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id int not null,
    title text not null,
    description_key uuid not null,
    time_limit int not null,
    test_cases_key uuid not null,
    primary key (rev, id),
    constraint fk_contest foreign key (contest_id) references contest (id),
    constraint fk_test_cases_key foreign key (test_cases_key) references attachment (key),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
