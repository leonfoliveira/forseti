package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class FrozenSubmissionTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create a frozen submission with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val member = MockEntityFactory.member()
            val problem = MockEntityFactory.problem()
            val code = MockEntityFactory.attachment()

            val frozenSubmission =
                FrozenSubmission(
                    member = member,
                    problem = problem,
                    language = Submission.Language.JAVA_21,
                    status = Submission.Status.JUDGED,
                    answer = Submission.Answer.ACCEPTED,
                    code = code,
                )

            assertNotNull(frozenSubmission.id)
            assertEquals(now, frozenSubmission.createdAt)
            assertEquals(now, frozenSubmission.updatedAt)
            assertNull(frozenSubmission.deletedAt)
            assertEquals(1L, frozenSubmission.version)
            assertEquals(member, frozenSubmission.member)
            assertEquals(problem, frozenSubmission.problem)
            assertEquals(Submission.Language.JAVA_21, frozenSubmission.language)
            assertEquals(Submission.Status.JUDGED, frozenSubmission.status)
            assertEquals(Submission.Answer.ACCEPTED, frozenSubmission.answer)
            assertEquals(code, frozenSubmission.code)
        }
    }

    @Test
    fun `should unfreeze a frozen submission`() {
        val member = MockEntityFactory.member()
        val problem = MockEntityFactory.problem()
        val code = MockEntityFactory.attachment()

        val frozenSubmission =
            FrozenSubmission(
                member = member,
                problem = problem,
                language = Submission.Language.JAVA_21,
                status = Submission.Status.JUDGED,
                answer = Submission.Answer.ACCEPTED,
                code = code,
            )

        val submission = frozenSubmission.unfreeze()

        assertEquals(frozenSubmission.id, submission.id)
        assertEquals(frozenSubmission.createdAt, submission.createdAt)
        assertEquals(frozenSubmission.updatedAt, submission.updatedAt)
        assertEquals(frozenSubmission.deletedAt, submission.deletedAt)
        assertEquals(frozenSubmission.version, submission.version)
        assertEquals(frozenSubmission.member, submission.member)
        assertEquals(frozenSubmission.problem, submission.problem)
        assertEquals(frozenSubmission.language, submission.language)
        assertEquals(frozenSubmission.status, submission.status)
        assertEquals(frozenSubmission.answer, submission.answer)
        assertEquals(frozenSubmission.code, submission.code)
    }

    @Test
    fun `should freeze a submission`() {
        val member = MockEntityFactory.member()
        val problem = MockEntityFactory.problem()
        val code = MockEntityFactory.attachment()

        val submission =
            Submission(
                member = member,
                problem = problem,
                language = Submission.Language.JAVA_21,
                status = Submission.Status.JUDGED,
                answer = Submission.Answer.ACCEPTED,
                code = code,
            )

        val frozenSubmission = submission.freeze()

        assertEquals(submission.id, frozenSubmission.id)
        assertEquals(submission.createdAt, frozenSubmission.createdAt)
        assertEquals(submission.updatedAt, frozenSubmission.updatedAt)
        assertEquals(submission.deletedAt, frozenSubmission.deletedAt)
        assertEquals(submission.version, frozenSubmission.version)
        assertEquals(submission.member, frozenSubmission.member)
        assertEquals(submission.problem, frozenSubmission.problem)
        assertEquals(submission.language, frozenSubmission.language)
        assertEquals(submission.status, frozenSubmission.status)
        assertEquals(submission.answer, frozenSubmission.answer)
        assertEquals(submission.code, frozenSubmission.code)
        assertEquals(submission.problem.contest, frozenSubmission.problem.contest)
    }
}
