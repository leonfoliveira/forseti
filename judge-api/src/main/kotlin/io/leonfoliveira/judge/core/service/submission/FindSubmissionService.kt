package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class FindSubmissionService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun findAllByContest(contestId: Int): List<Submission> {
        logger.info("Finding all submissions for contest with id: $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }
        val submissions =
            contest.members.map {
                it.submissions
            }.flatten()

        logger.info("Found ${submissions.size} submissions")
        return submissions.sortedBy { it.createdAt }
    }

    fun findAllByMember(memberId: Int): List<Submission> {
        logger.info("Finding all submissions for member with id: $memberId")

        val member =
            memberRepository.findById(memberId).orElseThrow {
                NotFoundException("Could not find member with id = $memberId")
            }

        logger.info("Found ${member.submissions.size} submissions for member")
        return member.submissions.sortedBy { it.createdAt }
    }

    fun findAllFailed(contestId: Int): List<Submission> {
        logger.info("Finding all failed submissions for contest with id: $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        val submissions =
            contest.members.map {
                it.submissions
            }.flatten().filter { it.hasFailed }

        logger.info("Found ${submissions.size} failed submissions")
        return submissions.sortedBy { it.createdAt }
    }
}
