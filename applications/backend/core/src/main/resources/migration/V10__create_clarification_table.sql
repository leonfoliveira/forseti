create table clarification (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id uuid not null,
    member_id uuid not null,
    problem_id uuid,
    parent_id uuid,
    text text not null,
    version bigint not null default 1,
    constraint fk_contest_id foreign key (contest_id) references contest (id),
    constraint fk_member_id foreign key (member_id) references member (id),
    constraint fk_problem_id foreign key (problem_id) references problem (id),
    constraint fk_parent_id foreign key (parent_id) references clarification (id)
);

create index idx_clarification_member_id on clarification (member_id);
create index idx_clarification_problem_id on clarification (problem_id);

create table clarification_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    contest_id uuid not null,
    member_id uuid not null,
    problem_id uuid,
    parent_id uuid,
    text text not null,
    text_mod boolean not null default false,
    version bigint not null,
    primary key (rev, id),
    constraint fk_contest_id foreign key (contest_id) references contest (id),
    constraint fk_member_id foreign key (member_id) references member (id),
    constraint fk_problem_id foreign key (problem_id) references problem (id),
    constraint fk_parent_id foreign key (parent_id) references clarification (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
