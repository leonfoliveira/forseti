package com.forsetijudge.core.application.service.external.member

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.Hasher
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.member.UpdateMemberPasswordUseCase
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class UpdateMemberPasswordService(
    private val memberRepository: MemberRepository,
    private val hasher: Hasher,
) : UpdateMemberPasswordUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional
    override fun execute(
        @Valid command: UpdateMemberPasswordUseCase.Command,
    ) {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Updating password for member with id = ${command.memberId}")

        val contextMember =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId")

        ContestAuthorizer(null, contextMember)
            .requireMemberType(Member.Type.API)
            .throwIfErrors()

        val member =
            memberRepository.findById(command.memberId)
                ?: throw NotFoundException("Could not find member with id = ${command.memberId}")

        val hashedPassword = hasher.hash(command.password)
        member.password = hashedPassword

        memberRepository.save(member)
        logger.info("Member password updated successfully")
    }
}
