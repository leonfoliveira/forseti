insert into member
    (id, created_at, updated_at, deleted_at, contest_id, type, name, login, password, version)
values
    ('00000000-0000-0000-0000-000000000000', now(), now(), null, null, 'ROOT', 'Root', 'root', md5(random()::text), 1)