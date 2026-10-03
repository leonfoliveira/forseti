package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.ForceEndContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class ForceEndContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : ForceEndContestUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Forces the end of a contest.
     *
     * @param command The command containing the contest ID to force end.
     * @return The updated Contest object after being forced to end.
     */
    @Transactional
    override fun execute(command: ForceEndContestUseCase.Command): ContestWithMembersAndProblemsResponseBodyDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Force ending contest with id: ${command.contestId} by member with id: $contextMemberId")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id: ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id: ${command.contestId} in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .requireContestActive()
            .throwIfErrors()

        contest.endAt = OffsetDateTime.now()
        contestRepository.save(contest)
        businessEventPublisher.publish(ContestEvent.Updated(contest.id))

        logger.info("Contest force ended successfully")
        return contest.toWithMembersAndProblemsResponseBodyDTO()
    }
}
