package io.github.leonfoliveira.forseti.common.service.problem

import io.github.leonfoliveira.forseti.common.domain.entity.Problem
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.repository.ProblemRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FindProblemService(
    val problemRepository: ProblemRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Finds a problem by its id.
     *
     * @param problemId The id of the problem
     * @return The problem
     * @throws NotFoundException If the problem is not found
     */
    @Transactional(readOnly = true)
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
