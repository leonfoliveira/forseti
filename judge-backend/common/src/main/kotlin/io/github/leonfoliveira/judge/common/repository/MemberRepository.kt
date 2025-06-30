package io.github.leonfoliveira.judge.common.repository

import io.github.leonfoliveira.judge.common.domain.entity.Member

interface MemberRepository : BaseRepository<Member> {
    fun findByLogin(login: String): Member?
}
