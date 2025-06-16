package io.github.leonfoliveira.judge.core.service.problem

import io.github.leonfoliveira.judge.core.domain.entity.Problem
import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.repository.ProblemRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FindProblemService(
    val problemRepository: ProblemRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun findById(problemId: UUID): Problem {
        logger.info("Finding problem with id: $problemId")

        val problem =
            problemRepository.findById(problemId).orElseThrow {
                NotFoundException("Could not find problem with id = $problemId")
            }

        logger.info("Found problem")
        return problem
    }
}
