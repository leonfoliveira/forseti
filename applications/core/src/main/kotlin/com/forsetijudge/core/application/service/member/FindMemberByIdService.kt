package com.forsetijudge.core.application.service.member

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import com.forsetijudge.core.port.dto.response.member.toResponseDTO
import com.forsetijudge.core.port.input.usecase.member.FindMemberByIdUseCase
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindMemberByIdService(
    private val memberRepository: MemberRepository,
) : FindMemberByIdUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(command: FindMemberByIdUseCase.Command): MemberResponseDTO {
        logger.info("Finding member by ID: ${command.memberId}")

        val member =
            memberRepository.findByIdNullable(command.memberId)
                ?: throw NotFoundException("Could not find member with ID: ${command.memberId}")

        return member.toResponseDTO()
    }
}
