package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.FrozenSubmission
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.contest.AutoFreezeContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime

class AutoFreezeContestServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val frozenSubmissionRepository = mock<FrozenSubmissionRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val service =
        AutoFreezeContestService(
            contestRepository = contestRepository,
            submissionRepository = submissionRepository,
            frozenSubmissionRepository = frozenSubmissionRepository,
            businessEventPublisher = businessEventPublisher,
        )

    private val contest = MockEntityFactory.contest()

    @Test
    fun `should skip auto freeze if contest is already frozen`() {
        val contest = MockEntityFactory.contest(frozenAt = OffsetDateTime.now().minusDays(1))
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)

        service.execute(AutoFreezeContestUseCase.Command(contestId = contest.id))

        verify(frozenSubmissionRepository, never()).saveAllAndFlush(any<List<FrozenSubmission>>())
        verify(contestRepository, never()).saveAndFlush(any())
        verify(businessEventPublisher, never()).publish(any())
    }

    @Test
    fun `should auto freeze contest successfully`() {
        val submissions = listOf(MockEntityFactory.submission())
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(submissionRepository.findAllByContestId(contest.id)).thenReturn(submissions)

        service.execute(AutoFreezeContestUseCase.Command(contestId = contest.id))

        val frozenSubmissionsCaptor = argumentCaptor<List<FrozenSubmission>>()
        verify(frozenSubmissionRepository).saveAllAndFlush(frozenSubmissionsCaptor.capture())
        assertEquals(submissions[0].id, frozenSubmissionsCaptor.firstValue[0].id)
        verify(contestRepository).saveAndFlush(contest)
        verify(businessEventPublisher).publish(ContestEvent.Frozen(contestId = contest.id))
    }
}
