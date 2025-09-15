create table revinfo (
    rev bigint primary key,
    "timestamp" timestamp not null,
    session_id uuid,
    trace_id text
);

create sequence revinfo_seq increment by 50;
