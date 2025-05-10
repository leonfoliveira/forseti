create table revinfo (
    rev serial primary key,
    revtstmp bigint
);

create table my_entity_aud (
    id bigint not null,
    rev int not null,
    revtype smallint,
    name varchar(255),
    primary key (id, rev),
    foreign key (rev) references revinfo(rev)
);