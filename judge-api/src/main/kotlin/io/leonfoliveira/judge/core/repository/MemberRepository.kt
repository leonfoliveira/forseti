package io.leonfoliveira.judge.core.repository

import io.leonfoliveira.judge.core.domain.entity.Member

interface MemberRepository : BaseRepository<Member> {
    fun findByLogin(login: String): Member?
}
