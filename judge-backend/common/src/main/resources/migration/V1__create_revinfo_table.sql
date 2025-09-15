create table revinfo (
    rev bigint primary key,
    "timestamp" timestamp not null,
    session_id uuid,
    ip text,
    trace_id text
);

create sequence revinfo_seq increment by 50;
