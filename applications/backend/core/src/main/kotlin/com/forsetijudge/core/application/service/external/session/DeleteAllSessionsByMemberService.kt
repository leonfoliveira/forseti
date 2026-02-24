package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.session.DeleteAllSessionsByMemberUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.DeleteAllSessionsByMemberInternalUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class DeleteAllSessionsByMemberService(
    private val memberRepository: MemberRepository,
    private val deleteAllSessionsByMemberInternalUseCase: DeleteAllSessionsByMemberInternalUseCase,
) : DeleteAllSessionsByMemberUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun execute() {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Deleting all sessions for member with id: $contextMemberId")

        val member =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Member with id $contextMemberId not found")

        deleteAllSessionsByMemberInternalUseCase.execute(
            DeleteAllSessionsByMemberInternalUseCase.Command(
                member = member,
            ),
        )

        logger.info("All sessions deleted successfully")
    }
}
