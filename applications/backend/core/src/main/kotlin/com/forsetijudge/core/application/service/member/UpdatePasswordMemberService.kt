package com.forsetijudge.core.application.service.member

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.Hasher
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.member.UpdatePasswordMemberUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UpdatePasswordMemberService(
    private val memberRepository: MemberRepository,
    private val hasher: Hasher,
) : UpdatePasswordMemberUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun update(
        memberId: UUID,
        password: String,
    ): Member {
        logger.info("Updating password for member with id = $memberId")

        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id = $memberId")

        member.password = hasher.hash(password)
        memberRepository.save(member)

        logger.info("Password updated successfully")
        return member
    }
}
