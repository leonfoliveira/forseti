create table submission (
    id serial primary key,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp,
    contest_id int not null,
    problem_id int not null,
    language text not null,
    status text not null,
    code_filename text not null,
    code_key text not null,
    constraint fk_contest foreign key (contest_id) references contest (id),
    constraint fk_problem foreign key (problem_id) references problem (id)
);

create table submission_aud (
    rev int not null,
    revtype smallint not null,
    id int not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp,
    contest_id int not null,
    problem_id int not null,
    language text not null,
    status text not null,
    code_filename text not null,
    code_key text not null,
    primary key (rev, id),
    constraint fk_contest foreign key (contest_id) references contest (id),
    constraint fk_problem foreign key (problem_id) references problem (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);