package io.github.leonfoliveira.judge.common.service.submission

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.repository.SubmissionRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FindSubmissionService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun findById(submissionId: UUID): Submission {
        logger.info("Finding submission with id: $submissionId")

        val submission =
            submissionRepository.findById(submissionId).orElseThrow {
                NotFoundException("Could not find submission with id = $submissionId")
            }

        logger.info("Found submission")
        return submission
    }

    fun findAllByContest(contestId: UUID): List<Submission> {
        logger.info("Finding all submissions for contest with id: $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        val submissions =
            contest.problems.map {
                it.submissions
            }.flatten()

        logger.info("Found ${submissions.size} submissions")
        return submissions.sortedBy { it.createdAt }
    }

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
