create table revinfo (
    rev serial primary key,
    revtstmp bigint
);

create sequence revinfo_seq increment by 50;
