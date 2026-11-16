package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class SubmissionTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create a submission with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

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

            assertNotNull(submission.id)
            assertEquals(now, submission.createdAt)
            assertEquals(now, submission.updatedAt)
            assertNull(submission.deletedAt)
            assertEquals(1L, submission.version)
            assertEquals(member, submission.member)
            assertEquals(problem, submission.problem)
            assertEquals(Submission.Language.JAVA_21, submission.language)
            assertEquals(Submission.Status.JUDGED, submission.status)
            assertEquals(Submission.Answer.ACCEPTED, submission.answer)
            assertEquals(code, submission.code)
        }
    }
}
