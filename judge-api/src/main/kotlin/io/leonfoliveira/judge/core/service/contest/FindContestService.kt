package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.output.ContestOutputDTO
import io.leonfoliveira.judge.core.service.dto.output.toOutputDTO
import org.springframework.stereotype.Service

@Service
class FindContestService(
    private val contestRepository: ContestRepository,
) {
    fun findAll(): List<ContestOutputDTO> {
        return contestRepository.findAll().toList().map {
            it.toOutputDTO()
        }
    }

    fun findById(id: Int): ContestOutputDTO {
        val contest =
            contestRepository.findById(id).orElseThrow {
                NotFoundException("Could not find contest with id = $id")
            }
        return contest.toOutputDTO()
    }
}
