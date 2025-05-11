package io.leonfoliveira.judge.core.repository

import io.leonfoliveira.judge.core.entity.Member

interface MemberRepository : BaseRepository<Member> {
    fun findByLogin(login: String): Member?
}