create table ticket (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id uuid not null,
    member_id uuid not null,
    staff_id uuid,
    type text not null,
    status text not null,
    properties jsonb not null,
    version bigint not null default 1,
    constraint fk_contest_id foreign key (contest_id) references contest (id),
    constraint fk_member_id foreign key (member_id) references member (id)
);

create index idx_ticket_member_id on ticket (member_id);
create index idx_ticket_contest_id on ticket (contest_id);

create table ticket_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    contest_id uuid not null,
    member_id uuid not null,
    staff_id uuid,
    staff_id_mod boolean not null default false,
    type text not null,
    status text not null,
    status_mod boolean not null default false,
    properties jsonb not null,
    version bigint not null,
    primary key (rev, id),
    constraint fk_contest_id foreign key (contest_id) references contest (id),
    constraint fk_member_id foreign key (member_id) references member (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
