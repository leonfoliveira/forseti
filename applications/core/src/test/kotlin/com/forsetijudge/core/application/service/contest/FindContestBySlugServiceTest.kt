package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.contest.FindContestBySlugUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.test.factory.MockEntityFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class FindContestBySlugServiceTest {
    private val repository = mock<ContestRepository>()
    private val service = FindContestBySlugService(repository)

    @Test
    fun `returns response for contest matching slug`() {
        val contest = MockEntityFactory.contest()
        whenever(repository.findBySlug(contest.slug)).thenReturn(contest)

        assertEquals(contest.id, service.execute(FindContestBySlugUseCase.Command(contest.slug)).id)
    }

    @Test
    fun `throws when slug is unknown`() {
        whenever(repository.findBySlug("unknown")).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(FindContestBySlugUseCase.Command("unknown"))
        }
    }
}
