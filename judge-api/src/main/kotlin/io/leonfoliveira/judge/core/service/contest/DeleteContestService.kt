package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.util.TimeUtils
import org.springframework.stereotype.Service

@Service
class DeleteContestService(
    private val contestRepository: ContestRepository,
) {
    fun deleteContest(id: Int) {
        val contest = contestRepository.findById(id).orElseThrow {
            NotFoundException("Could not find contest with id = $id")
        }
        contest.deletedAt = TimeUtils.now()
        contestRepository.save(contest)
    }
}