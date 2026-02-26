create table submission (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    member_id uuid not null,
    problem_id uuid not null,
    language text not null,
    status text not null,
    answer text,
    code_id uuid not null,
    version bigint not null default 1,
    constraint fk_member_id foreign key (member_id) references member (id),
    constraint fk_problem_id foreign key (problem_id) references problem (id),
    constraint fk_code_id foreign key (code_id) references attachment (id),
    constraint chk_answer_null_or_status_judging check (status <> 'JUDGING' or answer is null)
);

create index idx_submission_member_id on submission (member_id);
create index idx_submission_problem_id on submission (problem_id);

create table submission_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    member_id uuid not null,
    problem_id uuid not null,
    language text not null,
    status text not null,
    status_mod boolean not null default false,
    answer text,
    answer_mod boolean not null default false,
    code_id uuid not null,
    version bigint not null,
    primary key (rev, id),
    constraint fk_member_id foreign key (member_id) references member (id),
    constraint fk_problem_id foreign key (problem_id) references problem (id),
    constraint fk_code_id foreign key (code_id) references attachment (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);

create table frozen_submission (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    member_id uuid not null,
    problem_id uuid not null,
    language text not null,
    status text not null,
    answer text,
    code_id uuid not null,
    version bigint not null default 1,
    constraint fk_id foreign key (id) references submission (id),
    constraint fk_member_id foreign key (member_id) references member (id),
    constraint fk_problem_id foreign key (problem_id) references problem (id),
    constraint fk_code_id foreign key (code_id) references attachment (id)
);

create index idx_frozen_submission_member_id on frozen_submission (member_id);
create index idx_frozen_submission_problem_id on frozen_submission (problem_id);
