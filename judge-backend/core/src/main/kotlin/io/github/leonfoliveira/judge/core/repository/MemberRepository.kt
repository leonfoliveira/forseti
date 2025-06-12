package io.github.leonfoliveira.judge.core.repository

import io.github.leonfoliveira.judge.core.domain.entity.Member

interface MemberRepository : BaseRepository<Member> {
    fun findByLogin(login: String): Member?
}
