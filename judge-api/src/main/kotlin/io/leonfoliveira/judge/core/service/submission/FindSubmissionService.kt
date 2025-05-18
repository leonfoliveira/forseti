package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.service.dto.output.SubmissionOutputDTO
import io.leonfoliveira.judge.core.service.dto.output.toOutputDTO
import org.springframework.stereotype.Service

@Service
class FindSubmissionService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val bucketAdapter: BucketAdapter,
) {
    fun findAllByContest(contestId: Int): List<SubmissionOutputDTO> {
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

        return submissions.sortedBy { it.createdAt }.map { it.toOutputDTO(bucketAdapter) }
    }

    fun findAllByMember(memberId: Int): List<SubmissionOutputDTO> {
        val member =
            memberRepository.findById(memberId).orElseThrow {
                NotFoundException("Could not find member with id = $memberId")
            }
        return member.submissions.sortedBy { it.createdAt }.map { it.toOutputDTO(bucketAdapter) }
    }
}
