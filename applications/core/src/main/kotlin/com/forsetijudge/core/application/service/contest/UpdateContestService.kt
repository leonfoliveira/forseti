package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.attachment.AttachmentCommiter
import com.forsetijudge.core.application.helper.problem.TestCasesValidator
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.UpdateContestUseCase
import com.forsetijudge.core.port.output.cryptography.Hasher
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.ProblemRepository
import com.forsetijudge.core.util.ExecutionContext
import com.forsetijudge.core.util.SafeLogger
import jakarta.validation.Valid
import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class UpdateContestService(
    private val contestRepository: ContestRepository,
    private val problemRepository: ProblemRepository,
    private val memberRepository: MemberRepository,
    private val hasher: Hasher,
    private val testCasesValidator: TestCasesValidator,
    private val attachmentCommiter: AttachmentCommiter,
    private val businessEventPublisher: BusinessEventPublisher,
) : UpdateContestUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Updates an existing contest with the provided command data.
     *
     * @param command The command containing the data for updating the contest.
     * @return The updated contest entity.
     */
    @Transactional
    override fun execute(
        @Valid command: UpdateContestUseCase.Command,
    ): ContestWithMembersAndProblemsResponseBodyDTO {
        val contextMemberId = ExecutionContext.getMemberId()
        val now = OffsetDateTime.now()

        logger.info("Updating contest with id: ${command.contestId} by member with id: $contextMemberId")

        val contest =
            contestRepository
                .findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id = ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .requireContestNotEnded()
            .throwIfErrors()

        if (command.members.any { it.type == Member.Type.ROOT }) {
            throw ForbiddenException("Contest cannot have ROOT members")
        }

        val isUpdatingStartAt =
            !command.startAt.truncatedTo(ChronoUnit.SECONDS).isEqual(contest.startAt.truncatedTo(ChronoUnit.SECONDS))
        if (isUpdatingStartAt) {
            if (contest.hasStarted()) {
                throw ForbiddenException("Contest has already started and cannot have its start time updated")
            }

            if (command.startAt.isBefore(now)) {
                throw BusinessException("Contest start time must be in the future")
            }
        }

        if (contestRepository.existsBySlugAndIdNot(command.slug, contest.id)) {
            throw ConflictException("Contest with slug '${command.slug}' already exists")
        }

        contest.slug = command.slug
        contest.title = command.title
        contest.languages = command.languages
        contest.startAt = command.startAt
        contest.endAt = command.endAt

        val membersToCreate = command.members.filter { it.id == null }
        val problemsToCreate = command.problems.filter { it.id == null }
        val createdMembers = membersToCreate.map { createMember(contest, it) }
        val createdProblems = problemsToCreate.map { createProblem(contest, it) }

        val membersToUpdate = command.members.filter { it.id != null }
        val problemsToUpdate = command.problems.filter { it.id != null }
        val membersHash = contest.members.associateBy { it.id }
        val problemsHash = contest.problems.associateBy { it.id }
        val updatedMembers = membersToUpdate.map { updateMember(membersHash, it) }
        val updatedProblems = problemsToUpdate.map { updateProblem(contest, problemsHash, it) }

        val membersToUpdateIds = membersToUpdate.map { it.id }.toSet()
        val problemsToUpdateIds = problemsToUpdate.map { it.id }.toSet()
        val membersToDelete = contest.members.filter { it.id !in membersToUpdateIds }
        val problemsToDelete = contest.problems.filter { it.id !in problemsToUpdateIds }
        deleteMembers(membersToDelete)
        deleteProblems(problemsToDelete)

        contest.members = createdMembers + updatedMembers
        contest.problems = createdProblems + updatedProblems
        contestRepository.save(contest)
        businessEventPublisher.publish(ContestEvent.Updated(contest.id))

        logger.info("Contest updated successfully with id: ${contest.id}")
        return contest.toWithMembersAndProblemsResponseBodyDTO()
    }

    /**
     * Creates a new member for the given contest based on the provided DTO.
     */
    private fun createMember(
        contest: Contest,
        memberDTO: UpdateContestUseCase.Command.Member,
    ): Member {
        logger.info("Creating member with login: ${memberDTO.login}")

        // Forbid members to have ROOT login. It is required to ensure a root can sign-in in any contest.
        if (memberDTO.login == Member.ROOT_LOGIN) {
            throw ForbiddenException("Member login cannot be '${Member.ROOT_LOGIN}'")
        }

        val hashedPassword = hasher.hash(memberDTO.password!!)
        val member =
            Member(
                type = memberDTO.type,
                name = memberDTO.name,
                login = memberDTO.login,
                password = hashedPassword,
                contest = contest,
            )

        return member
    }

    /**
     * Creates a new problem for the given contest based on the provided DTO.
     */
    private fun createProblem(
        contest: Contest,
        problemDTO: UpdateContestUseCase.Command.Problem,
    ): Problem {
        logger.info("Creating problem with title: ${problemDTO.title}")

        val description =
            attachmentCommiter.commit(problemDTO.description.id, contest.id, Attachment.Context.PROBLEM_DESCRIPTION)
        val testCases =
            attachmentCommiter.commit(problemDTO.testCases.id, contest.id, Attachment.Context.PROBLEM_TEST_CASES)
        testCasesValidator.validate(testCases)

        val problem =
            Problem(
                letter = problemDTO.letter,
                color = problemDTO.color.lowercase(),
                title = problemDTO.title,
                description = description,
                timeLimit = problemDTO.timeLimit,
                memoryLimit = problemDTO.memoryLimit,
                testCases = testCases,
                contest = contest,
            )

        return problem
    }

    /**
     * Updates an existing member based on the provided DTO.
     *
     * @param membersHash A map of existing members keyed by their IDs.
     * @param memberDTO The DTO containing updated member information.
     * @return The updated member.
     * @throws NotFoundException If the member with the given ID is not found.
     */
    private fun updateMember(
        membersHash: Map<UUID, Member>,
        memberDTO: UpdateContestUseCase.Command.Member,
    ): Member {
        logger.info("Updating member with id: ${memberDTO.id}")

        val member =
            membersHash[memberDTO.id]
                ?: throw NotFoundException("Could not find member with id = ${memberDTO.id}")

        member.type = memberDTO.type
        member.name = memberDTO.name
        member.login = memberDTO.login
        if (memberDTO.password != null) {
            member.password = hasher.hash(memberDTO.password)
        }

        return member
    }

    /**
     * Updates an existing problem based on the provided DTO.
     *
     * @param problemsHash A map of existing problems keyed by their IDs.
     * @param problemDTO The DTO containing updated problem information.
     * @return The updated problem.
     * @throws NotFoundException If the problem or any referenced attachments are not found.
     */
    private fun updateProblem(
        contest: Contest,
        problemsHash: Map<UUID, Problem>,
        problemDTO: UpdateContestUseCase.Command.Problem,
    ): Problem {
        logger.info("Updating problem with id: ${problemDTO.id}")

        val problem =
            problemsHash[problemDTO.id]
                ?: throw NotFoundException("Could not find problem with id = ${problemDTO.id}")

        if (problem.description.id != problemDTO.description.id) {
            val description =
                attachmentCommiter.commit(problemDTO.description.id, contest.id, Attachment.Context.PROBLEM_DESCRIPTION)
            problem.description = description
        }
        if (problem.testCases.id != problemDTO.testCases.id) {
            val testCases =
                attachmentCommiter.commit(problemDTO.testCases.id, contest.id, Attachment.Context.PROBLEM_TEST_CASES)
            testCasesValidator.validate(testCases)
            problem.testCases = testCases
        }

        problem.letter = problemDTO.letter
        problem.title = problemDTO.title
        problem.timeLimit = problemDTO.timeLimit
        problem.memoryLimit = problemDTO.memoryLimit

        return problem
    }

    /**
     * Marks the given members as deleted by setting their deletedAt timestamp.
     *
     * @param members The list of members to be marked as deleted.
     */
    private fun deleteMembers(members: List<Member>) {
        logger.info("Deleting members with ids: ${members.map { it.id }}")
        val now = OffsetDateTime.now()

        members.forEach { it.deletedAt = now }
        memberRepository.saveAll(members)
    }

    /**
     * Marks the given problems as deleted by setting their deletedAt timestamp.
     *
     * @param problems The list of problems to be marked as deleted.
     */
    private fun deleteProblems(problems: List<Problem>) {
        logger.info("Deleting problems with ids: ${problems.map { it.id }}")
        val now = OffsetDateTime.now()

        problems.forEach {
            it.deletedAt = now
            it.description.isCommited = false
            it.testCases.isCommited = false
        }
        problemRepository.saveAll(problems)
    }
}
