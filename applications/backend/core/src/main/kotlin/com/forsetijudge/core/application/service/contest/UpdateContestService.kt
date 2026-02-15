package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.util.TestCasesValidator
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.Hasher
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driving.usecase.contest.UpdateContestUseCase
import com.forsetijudge.core.port.dto.input.contest.UpdateContestInputDTO
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
@Validated
class UpdateContestService(
    private val attachmentRepository: AttachmentRepository,
    private val contestRepository: ContestRepository,
    private val hasher: Hasher,
    private val deleteContestService: DeleteContestService,
    private val testCasesValidator: TestCasesValidator,
) : UpdateContestUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Updates a contest with the provided input data.
     * For members and problems:
     * - If an ID is provided, the existing entity is updated.
     * - If no ID is provided, a new entity is created.
     * - Any existing entities not included in the input are deleted.
     *
     * @param contestId The ID of the contest to be updated.
     * @param inputDTO The input data for updating the contest.
     * @return The updated contest.
     * @throws NotFoundException If the contest or any referenced entities are not found.
     * @throws ForbiddenException If the update violates any business rules.
     * @throws ConflictException If there is a conflict with existing data (e.g., duplicate slug).
     * @throws BusinessException If any business logic validation fails.
     */
    @Transactional
    override fun update(
        contestId: UUID,
        @Valid inputDTO: UpdateContestInputDTO,
    ): Contest {
        logger.info("Updating contest with id: $contestId")

        if (inputDTO.members.any { it.type == Member.Type.ROOT }) {
            throw ForbiddenException("Contest cannot have ROOT members")
        }
        if (inputDTO.members.any { it.type.isSystemType() }) {
            throw ForbiddenException("Contest cannot have system members")
        }

        val contest =
            contestRepository
                .findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")

        if (contest.hasFinished()) {
            throw ForbiddenException("Contest has already finished and cannot be updated")
        }

        if (contest.hasStarted()) {
            if (!inputDTO.startAt.truncatedTo(ChronoUnit.SECONDS).isEqual(contest.startAt.truncatedTo(ChronoUnit.SECONDS))) {
                throw ForbiddenException("Contest has already started and cannot have its start time updated")
            }
        } else {
            if (inputDTO.startAt.isBefore(OffsetDateTime.now())) {
                throw BusinessException("Contest start time must be in the future")
            }
        }

        if (inputDTO.autoFreezeAt != null) {
            if (inputDTO.autoFreezeAt.isBefore(inputDTO.startAt) || inputDTO.autoFreezeAt.isAfter(inputDTO.endAt)) {
                throw BusinessException("Contest autoFreezeAt must be between startAt and endAt")
            }

            if (contest.autoFreezeAt == null ||
                !inputDTO.autoFreezeAt.truncatedTo(ChronoUnit.SECONDS).isEqual(contest.autoFreezeAt!!.truncatedTo(ChronoUnit.SECONDS))
            ) {
                if (inputDTO.autoFreezeAt.isBefore(OffsetDateTime.now())) {
                    throw BusinessException("Contest autoFreezeAt must be in the future")
                }
            }
        }

        if (contestRepository.existsBySlugAndIdNot(inputDTO.slug, contestId)) {
            throw ConflictException("Contest with slug '${inputDTO.slug}' already exists")
        }

        contest.slug = inputDTO.slug
        contest.title = inputDTO.title
        contest.languages = inputDTO.languages
        contest.startAt = inputDTO.startAt
        contest.endAt = inputDTO.endAt
        contest.autoFreezeAt = inputDTO.autoFreezeAt
        contest.settings =
            Contest.Settings(
                isAutoJudgeEnabled = inputDTO.settings.isAutoJudgeEnabled,
            )

        val membersToCreate = inputDTO.members.filter { it.id == null }
        val problemsToCreate = inputDTO.problems.filter { it.id == null }
        val createdMembers = membersToCreate.map { createMember(contest, it) }
        val createdProblems = problemsToCreate.map { createProblem(contest, it) }

        val membersToUpdate = inputDTO.members.filter { it.id != null }
        val problemsToUpdate = inputDTO.problems.filter { it.id != null }
        val membersHash = contest.members.associateBy { it.id }
        val problemsHash = contest.problems.associateBy { it.id }
        val updatedMembers = membersToUpdate.map { updateMember(membersHash, it) }
        val updatedProblems = problemsToUpdate.map { updateProblem(problemsHash, it) }

        val membersToUpdateIds = membersToUpdate.map { it.id }.toSet()
        val problemsToUpdateIds = problemsToUpdate.map { it.id }.toSet()
        val membersToDelete = contest.members.filter { it.id !in membersToUpdateIds }
        val problemsToDelete = contest.problems.filter { it.id !in problemsToUpdateIds }
        deleteContestService.deleteMembers(membersToDelete)
        deleteContestService.deleteProblems(problemsToDelete)

        contest.members = createdMembers + updatedMembers
        contest.problems = createdProblems + updatedProblems
        contestRepository.save(contest)

        logger.info("Finished updating contest with id: ${contest.id}")
        return contest
    }

    /**
     * Forces the start of a contest by setting its start time to the current time.
     *
     * @param contestId The ID of the contest to be started.
     * @return The updated contest with the new start time.
     * @throws NotFoundException If the contest with the given ID is not found.
     * @throws ForbiddenException If the contest has already started.
     */
    @Transactional
    override fun forceStart(contestId: UUID): Contest {
        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")

        if (contest.hasStarted()) {
            throw ForbiddenException("Contest with id: $contestId has already started")
        }

        contest.startAt = OffsetDateTime.now()
        contestRepository.save(contest)
        return contest
    }

    /**
     * Forces the end of a contest by setting its end time to the current time.
     *
     * @param contestId The ID of the contest to be ended.
     * @return The updated contest with the new end time.
     * @throws NotFoundException If the contest with the given ID is not found.
     * @throws ForbiddenException If the contest is not currently active.
     */
    @Transactional
    override fun forceEnd(contestId: UUID): Contest {
        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")

        if (!contest.isActive()) {
            throw ForbiddenException("Contest with id: $contestId is not active")
        }

        contest.endAt = OffsetDateTime.now()
        contestRepository.save(contest)
        return contest
    }

    /**
     * Creates a new member for the given contest based on the provided DTO.
     */
    private fun createMember(
        contest: Contest,
        memberDTO: UpdateContestInputDTO.MemberDTO,
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
        problemDTO: UpdateContestInputDTO.ProblemDTO,
    ): Problem {
        logger.info("Creating problem with title: ${problemDTO.title}")

        val description =
            attachmentRepository.findEntityById(problemDTO.description.id)
                ?: throw NotFoundException("Could not find description attachment with id: ${problemDTO.description.id}")
        if (description.context != Attachment.Context.PROBLEM_DESCRIPTION) {
            throw ForbiddenException("Attachment with id: ${description.id} is not a valid problem description")
        }
        val testCases =
            attachmentRepository.findEntityById(problemDTO.testCases.id)
                ?: throw NotFoundException("Could not find testCases attachment with id: ${problemDTO.testCases.id}")
        if (testCases.context != Attachment.Context.PROBLEM_TEST_CASES) {
            throw ForbiddenException("Attachment with id: ${testCases.id} is not a valid problem test cases")
        }
        // Validate if the test cases file follows the expected format
        testCasesValidator.validate(testCases)

        val problem =
            Problem(
                letter = problemDTO.letter,
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
        memberDTO: UpdateContestInputDTO.MemberDTO,
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
        problemsHash: Map<UUID, Problem>,
        problemDTO: UpdateContestInputDTO.ProblemDTO,
    ): Problem {
        logger.info("Updating problem with id: ${problemDTO.id}")

        val problem =
            problemsHash[problemDTO.id]
                ?: throw NotFoundException("Could not find problem with id = ${problemDTO.id}")

        if (problem.description.id != problemDTO.description.id) {
            val description =
                attachmentRepository.findEntityById(problemDTO.description.id)
                    ?: throw NotFoundException("Could not find description attachment with id: ${problemDTO.description.id}")
            if (description.context != Attachment.Context.PROBLEM_DESCRIPTION) {
                throw ForbiddenException("Attachment with id: ${description.id} is not a valid problem description")
            }
            problem.description = description
        }
        if (problem.testCases.id != problemDTO.testCases.id) {
            val testCases =
                attachmentRepository.findEntityById(problemDTO.testCases.id)
                    ?: throw NotFoundException("Could not find testCases attachment with id: ${problemDTO.testCases.id}")
            if (testCases.context != Attachment.Context.PROBLEM_TEST_CASES) {
                throw ForbiddenException("Attachment with id: ${testCases.id} is not a valid problem test cases")
            }
            testCasesValidator.validate(testCases)
            problem.testCases = testCases
        }

        problem.letter = problemDTO.letter
        problem.title = problemDTO.title
        problem.timeLimit = problemDTO.timeLimit
        problem.memoryLimit = problemDTO.memoryLimit

        return problem
    }
}
