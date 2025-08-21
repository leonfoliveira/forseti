package io.github.leonfoliveira.judge.common.repository

import io.github.leonfoliveira.judge.common.domain.entity.Member
import java.util.UUID

interface MemberRepository : BaseRepository<Member> {
    fun findByLogin(login: String): Member?

    fun findByLoginAndContestId(login: String, contestId: UUID?): Member?
}
