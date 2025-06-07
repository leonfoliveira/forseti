create table submission (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    member_id uuid not null,
    problem_id uuid not null,
    language text not null,
    status text not null,
    answer text not null,
    code_id uuid not null,
    constraint fk_member_id foreign key (member_id) references member (id),
    constraint fk_problem_id foreign key (problem_id) references problem (id),
    constraint fk_code_id foreign key (code_id) references attachment (id)
);

create index idx_submission_member_id on submission (member_id);
create index idx_submission_problem_id on submission (problem_id);

create table submission_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    updated_at_mod boolean not null default false,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    member_id uuid not null,
    problem_id uuid not null,
    language text not null,
    language_mod boolean not null default false,
    status text not null,
    status_mod boolean not null default false,
    answer text not null,
    answer_mod boolean not null default false,
    code_id uuid not null,
    code_id_mod boolean not null default false,
    primary key (rev, id),
    constraint fk_member_id foreign key (member_id) references member (id),
    constraint fk_problem_id foreign key (problem_id) references problem (id),
    constraint fk_code_id foreign key (code_id) references attachment (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
