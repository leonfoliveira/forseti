create table member (
    id serial primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id int not null,
    type text not null,
    name text not null,
    login text not null,
    password text not null,
    constraint fk_contest foreign key (contest_id) references contest (id)
);

create table member_aud (
    rev int not null,
    revtype smallint not null,
    id int not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    contest_id int not null,
    type text not null,
    name text not null,
    login text not null,
    password text not null,
    primary key (rev, id),
    constraint fk_contest foreign key (contest_id) references contest (id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);