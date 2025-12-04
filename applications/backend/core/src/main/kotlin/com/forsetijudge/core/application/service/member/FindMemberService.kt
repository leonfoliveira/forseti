package com.forsetijudge.core.application.service.member

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.member.FindMemberUseCase
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FindMemberService(
    private val memberRepository: MemberRepository,
) : FindMemberUseCase {
    override fun findById(id: UUID) =
        memberRepository.findEntityById(id)
            ?: throw NotFoundException("Could not find member with id = $id")
}
