create table attachment (
    id uuid not null primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id uuid not null,
    member_id uuid not null,
    filename text not null,
    content_type text not null,
    context text not null,
    version bigint not null default 1,
    constraint fk_contest_id foreign key (contest_id) references contest (id),
    constraint fk_member_id foreign key (member_id) references member (id),
    constraint chk_filename_length check (length(filename) between 1 and 255),
    constraint chk_content_type_length check (length(content_type) between 1 and 30),
    constraint chk_content_type_mime check (content_type ~ '^[^[:space:]/]+/[^[:space:]/]+$')
);

create table attachment_aud (
    rev bigint not null,
    revtype smallint not null,
    id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    deleted_at_mod boolean not null default false,
    contest_id uuid not null,
    member_id uuid not null,
    filename text not null,
    content_type text not null,
    context text not null,
    version bigint not null,
    primary key (rev, id),
    constraint fk_rev foreign key (rev) references revinfo (rev),
    constraint fk_contest_id foreign key (contest_id) references contest (id),
    constraint fk_member_id foreign key (member_id) references member (id)
);
