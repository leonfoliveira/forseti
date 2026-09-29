package com.forsetijudge.core.application.service.session

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.session.SessionDeleter
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.session.DeleteAllSessionsByContextMemberUseCase
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DeleteAllSessionsByContextMemberService(
    private val memberRepository: MemberRepository,
    private val sessionDeleter: SessionDeleter,
) : DeleteAllSessionsByContextMemberUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Deletes all sessions associated with a specific member.
     */
    @Transactional
    override fun execute() {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Deleting all sessions for member with id: $contextMemberId")

        val member =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Member with id $contextMemberId not found")

        sessionDeleter.deleteAllByMember(member)

        logger.info("All sessions deleted successfully")
    }
}
