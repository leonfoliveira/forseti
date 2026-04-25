package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.application.service.internal.session.SessionDeleter
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.session.DeleteAllSessionsByMemberUseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DeleteAllSessionsByMemberService(
    private val memberRepository: MemberRepository,
    private val sessionDeleter: SessionDeleter,
) : DeleteAllSessionsByMemberUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute() {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Deleting all sessions for member with id: $contextMemberId")

        val member =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Member with id $contextMemberId not found")

        sessionDeleter.deleteAllByMember(member)

        logger.info("All sessions deleted successfully")
    }
}
