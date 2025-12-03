package com.forsetijudge.core.application.service.problem

import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driving.usecase.problem.FindProblemUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FindProblemService(
    val problemRepository: ProblemRepository,
) : FindProblemUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Finds a problem by its id.
     *
     * @param problemId The id of the problem
     * @return The problem
     * @throws NotFoundException If the problem is not found
     */
    @Transactional(readOnly = true)
    override fun findById(problemId: UUID): Problem {
        logger.info("Finding problem with id: $problemId")

        val problem =
            problemRepository.findEntityById(problemId)
                ?: throw NotFoundException("Could not find problem with id = $problemId")

        logger.info("Found problem")
        return problem
    }
}
