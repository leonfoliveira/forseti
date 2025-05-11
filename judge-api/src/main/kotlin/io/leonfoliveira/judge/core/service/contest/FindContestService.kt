package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.entity.Contest
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import org.springframework.stereotype.Service

@Service
class FindContestService(
    private val contestRepository: ContestRepository,
) {
    fun findAll(): List<Contest> {
        return contestRepository.findAll().toList()
    }

    fun findById(id: Int): Contest {
        return contestRepository.findById(id).orElseThrow {
            NotFoundException("Could not find contest with id = $id")
        }
    }
}