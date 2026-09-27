package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.ForceStartContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.ExecutionContext
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ForceStartContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
) : ForceStartContestUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Forces the start of a contest.
     *
     * @param command The command containing the contest ID to force start.
     * @return The updated Contest object after being forced to start.
     */
    @Transactional
    override fun execute(command: ForceStartContestUseCase.Command): ContestWithMembersAndProblemsResponseBodyDTO {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Force starting contest with id: ${command.contestId} by member with id: $contextMemberId")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id: ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .requireContestNotStarted()
            .throwIfErrors()

        if (contest.hasStarted()) {
            throw ForbiddenException("Cannot force start a contest that has already started")
        }

        contest.startAt = OffsetDateTime.now()
        contestRepository.save(contest)

        logger.info("Contest force started successfully")
        return contest.toWithMembersAndProblemsResponseBodyDTO()
    }
}
