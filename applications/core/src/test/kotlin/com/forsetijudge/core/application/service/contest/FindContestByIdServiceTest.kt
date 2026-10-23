package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.input.usecase.contest.FindContestByIdUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class FindContestByIdServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val service = FindContestByIdService(contestRepository)

    @Test
    fun `should throw NotFoundException when contest is not found`() {
        whenever(contestRepository.findByIdNullable(any())).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(FindContestByIdUseCase.Command(id = IdGenerator.getUUID()))
        }
    }

    @Test
    fun `should return contest when contest is found`() {
        val contest = MockEntityFactory.contest()
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)

        val result = service.execute(FindContestByIdUseCase.Command(id = contest.id))

        assertEquals(contest.toResponseDTO(), result)
    }
}
