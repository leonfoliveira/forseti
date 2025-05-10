create table revinfo (
    rev int primary key auto_increment,
    revtstmp bigint
);

create table my_entity_aud (
    id bigint not null,
    rev int not null,
    revtype tinyint,
    name varchar(255),
    primary key (id, rev),
    foreign key (rev) references revinfo(rev)
);