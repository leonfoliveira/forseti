package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.contest.DeleteContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.ExecutionContext
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DeleteContestService(
    private val memberRepository: MemberRepository,
    private val contestRepository: ContestRepository,
) : DeleteContestUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Deletes a contest with the provided command.
     *
     * @param command The command containing the contest ID to be deleted.
     */
    @Transactional
    override fun execute(command: DeleteContestUseCase.Command) {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Deleting contest with id: ${command.contestId} by member with id: $contextMemberId")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id = $contextMemberId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id '$contextMemberId' in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.ROOT)
            .requireContestNotStarted()
            .throwIfErrors()

        contest.deletedAt = OffsetDateTime.now()
        contestRepository.save(contest)

        logger.info("Contest deleted successfully")
    }
}
