package live.forseti.core.application.service.submission

import live.forseti.core.domain.entity.Submission
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.repository.ContestRepository
import live.forseti.core.port.driven.repository.MemberRepository
import live.forseti.core.port.driven.repository.SubmissionRepository
import live.forseti.core.port.driving.usecase.FindSubmissionUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FindSubmissionService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
) : FindSubmissionUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Finds a submission by its ID.
     *
     * @param submissionId ID of the submission to find
     * @return The found submission
     * @throws NotFoundException if the submission is not found
     */
    @Transactional(readOnly = true)
    override fun findById(submissionId: UUID): Submission {
        logger.info("Finding submission with id: $submissionId")

        val submission =
            submissionRepository.findEntityById(submissionId)
                ?: throw NotFoundException("Could not find submission with id = $submissionId")

        logger.info("Found submission")
        return submission
    }

    /**
     * Finds all submissions for a given contest.
     *
     * @param contestId ID of the contest
     * @return List of submissions for the contest
     * @throws NotFoundException if the contest is not found
     */
    @Transactional(readOnly = true)
    override fun findAllByContest(contestId: UUID): List<Submission> {
        logger.info("Finding all submissions for contest with id: $contestId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")
        val submissions =
            contest.problems
                .map {
                    it.submissions
                }.flatten()

        logger.info("Found ${submissions.size} submissions")
        return submissions.sortedBy { it.createdAt }
    }

    /**
     * Finds all submissions for a given member.
     *
     * @param memberId ID of the member
     * @return List of submissions for the member
     * @throws NotFoundException if the member is not found
     */
    @Transactional(readOnly = true)
    override fun findAllByMember(memberId: UUID): List<Submission> {
        logger.info("Finding all submissions for member with id: $memberId")

        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id = $memberId")

        logger.info("Found ${member.submissions.size} submissions for member")
        return member.submissions.sortedBy { it.createdAt }
    }
}
