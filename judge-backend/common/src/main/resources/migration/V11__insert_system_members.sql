insert into member
    (id, created_at, updated_at, deleted_at, contest_id, type, name, login, password)
values
    ('00000000-0000-0000-0000-000000000000', now(), now(), null, null, 'ROOT', 'Root', 'root', md5(random()::text)),
    ('11111111-1111-1111-1111-111111111111', now(), now(), null, null, 'AUTOJUDGE', 'Autojudge', 'autojudge', md5(random()::text));