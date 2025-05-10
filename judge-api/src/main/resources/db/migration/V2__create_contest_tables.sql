create table contest (
    id serial primary key,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp,
    title text not null,
    languages text[] not null,
    start_time timestamp not null,
    end_time timestamp not null
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
    start_time timestamp not null,
    end_time timestamp not null,
    primary key (rev, id),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);