package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationDeletedEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.clarification.DeleteClarificationUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.UUID

@Service
class DeleteClarificationService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val clarificationRepository: ClarificationRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : DeleteClarificationUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Soft deletes a clarification and all its children.
     *
     * @param contestId The ID of the clarification to be deleted.
     * @param memberId The ID of the member performing the deletion.
     * @param id The ID of the clarification to be deleted.
     * @throws NotFoundException if the clarification is not found.
     */
    @Transactional
    override fun delete(
        contestId: UUID,
        memberId: UUID,
        id: UUID,
    ) {
        logger.info("Deleting clarification with id: $id in contest: $contestId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id $contestId")
        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id $memberId")

        ContestAuthorizer(contest, member).checkMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)

        val clarification =
            clarificationRepository.findByIdAndContestId(id, contestId)
                ?: throw NotFoundException("Could not find clarification with id $id in contest")

        delete(clarification)
        clarificationRepository.save(clarification)
        applicationEventPublisher.publishEvent(ClarificationDeletedEvent(this, clarification))

        logger.info("Clarification deleted successfully")
    }

    /**
     * Recursively soft deletes a clarification and all its children.
     *
     * @param clarification The clarification to be deleted.
     */
    private fun delete(clarification: Clarification) {
        clarification.deletedAt = OffsetDateTime.now()
        clarification.children.forEach { delete(it) }
    }
}
