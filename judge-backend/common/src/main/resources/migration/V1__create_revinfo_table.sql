create table revinfo (
    rev bigint primary key,
    "timestamp" timestamp not null,
    member_id uuid,
    trace_id text
);

create sequence revinfo_seq increment by 50;
