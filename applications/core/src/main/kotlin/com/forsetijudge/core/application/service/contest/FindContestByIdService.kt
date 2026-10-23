package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.ContestResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.input.usecase.contest.FindContestByIdUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindContestByIdService(
    private val contestRepository: ContestRepository,
) : FindContestByIdUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(command: FindContestByIdUseCase.Command): ContestResponseDTO {
        logger.info("Finding contest by ID: ${command.id}")

        val contest =
            contestRepository.findByIdNullable(command.id)
                ?: throw NotFoundException("Contest with ID ${command.id} not found")

        return contest.toResponseDTO()
    }
}
