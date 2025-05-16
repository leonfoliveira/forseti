create table contest (
    id serial primary key,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    title text not null,
    languages text[] not null,
    start_at timestamp not null,
    end_at timestamp not null
);

create table contest_aud (
    rev int not null,
    revtype smallint not null,
    id int not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    deleted_at timestamp,
    title text not null,
    languages text[] not null,
    start_at timestamp not null,
    end_at timestamp not null,
    primary key (rev, id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);