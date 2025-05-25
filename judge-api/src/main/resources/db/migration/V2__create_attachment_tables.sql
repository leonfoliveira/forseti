create table attachment (
    key uuid primary key,
    created_at timestamp not null,
    filename text not null,
    content_type text not null
);

create table attachment_aud (
    rev int not null,
    revtype smallint not null,
    key uuid not null,
    created_at timestamp not null,
    filename text not null,
    content_type text not null,
    primary key (rev, key),
    constraint fk_rev foreign key (rev) references revinfo (rev)
);
