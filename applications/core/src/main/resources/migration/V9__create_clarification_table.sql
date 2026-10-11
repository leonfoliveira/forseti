create table clarification
(
    id                 uuid      not null primary key,
    created_at         timestamp not null,
    updated_at         timestamp not null,
    deleted_at         timestamp,
    version            bigint    not null default 1,
    contest_id         uuid      not null,
    problem_id         uuid,
    question_member_id uuid      not null,
    question_text      text      not null,
    answer_member_id   uuid,
    answer_text        text,
    is_public          boolean   not null default false,
    constraint fk_clarification_contest_id foreign key (contest_id) references contest (id),
    constraint fk_clarification_question_member_id foreign key (question_member_id) references member (id),
    constraint fk_clarification_answer_member_id foreign key (answer_member_id) references member (id)
);

create index idx_clarification_contest_id on clarification (contest_id);
create index idx_clarification_question_member_id on clarification (question_member_id);

create table clarification_aud
(
    rev                  bigint    not null,
    revtype              smallint  not null,
    id                   uuid      not null,
    created_at           timestamp not null,
    updated_at           timestamp not null,
    deleted_at           timestamp,
    deleted_at_mod       boolean   not null default false,
    version              bigint    not null default 1,
    contest_id           uuid      not null,
    problem_id           uuid,
    question_member_id   uuid      not null,
    question_text        text      not null,
    answer_member_id     uuid,
    answer_member_id_mod boolean   not null default false,
    answer_text          text,
    answer_text_mod      boolean   not null default false,
    is_public            boolean   not null default false,
    is_public_mod        boolean   not null default false,
    primary key (rev, id),
    constraint fk_clarification_contest_id foreign key (contest_id) references contest (id),
    constraint fk_clarification_question_member_id foreign key (question_member_id) references member (id),
    constraint fk_clarification_answer_member_id foreign key (answer_member_id) references member (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);