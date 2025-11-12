package io.github.leonfoliveira.forseti.common.service.submission

import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.repository.SubmissionRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FindSubmissionService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional(readOnly = true)
    fun findById(submissionId: UUID): Submission {
        logger.info("Finding submission with id: $submissionId")

        val submission =
            submissionRepository.findById(submissionId).orElseThrow {
                NotFoundException("Could not find submission with id = $submissionId")
            }

        logger.info("Found submission")
        return submission
    }

    @Transactional(readOnly = true)
    fun findAllByContest(contestId: UUID): List<Submission> {
        logger.info("Finding all submissions for contest with id: $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        val submissions =
            contest.problems
                .map {
                    it.submissions
                }.flatten()

        logger.info("Found ${submissions.size} submissions")
        return submissions.sortedBy { it.createdAt }
    }

    @Transactional(readOnly = true)
    fun findAllByMember(memberId: UUID): List<Submission> {
        logger.info("Finding all submissions for member with id: $memberId")

        val member =
            memberRepository.findById(memberId).orElseThrow {
                NotFoundException("Could not find member with id = $memberId")
            }

        logger.info("Found ${member.submissions.size} submissions for member")
        return member.submissions.sortedBy { it.createdAt }
    }
}
