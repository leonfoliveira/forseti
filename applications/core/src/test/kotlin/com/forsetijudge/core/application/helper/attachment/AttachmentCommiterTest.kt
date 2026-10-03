package com.forsetijudge.core.application.helper.attachment

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.repository.AttachmentRepository
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

class AttachmentCommiterTest {
    private val repository = mock<AttachmentRepository>()
    private val committer = AttachmentCommiter(repository)

    @Test
    fun `commits matching attachment and saves it`() {
        val attachment =
            MockEntityFactory.attachment(
                context = Attachment.Context.SUBMISSION_CODE,
            )
        whenever(repository.findByIdAndContestId(attachment.id, attachment.contest.id)).thenReturn(attachment)

        val result =
            committer.commit(
                attachment.id,
                attachment.contest.id,
                Attachment.Context.SUBMISSION_CODE,
            )

        assertSame(attachment, result)
        assertTrue(attachment.isCommited)
        verify(repository).save(attachment)
    }

    @Test
    fun `fails if attachment is absent`() {
        val attachmentId = UUID.randomUUID()
        val contestId = UUID.randomUUID()
        whenever(repository.findByIdAndContestId(attachmentId, contestId)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            committer.commit(attachmentId, contestId, Attachment.Context.PROBLEM_DESCRIPTION)
        }
        verify(repository, never()).save(org.mockito.kotlin.any())
    }

    @Test
    fun `rejects attachments already committed or with a different context`() {
        val alreadyCommitted = MockEntityFactory.attachment(isCommited = true)
        whenever(repository.findByIdAndContestId(alreadyCommitted.id, alreadyCommitted.contest.id))
            .thenReturn(alreadyCommitted)
        assertThrows(ForbiddenException::class.java) {
            committer.commit(alreadyCommitted.id, alreadyCommitted.contest.id, alreadyCommitted.context)
        }

        val wrongContext = MockEntityFactory.attachment(context = Attachment.Context.PROBLEM_DESCRIPTION)
        whenever(repository.findByIdAndContestId(wrongContext.id, wrongContext.contest.id)).thenReturn(wrongContext)
        assertThrows(ForbiddenException::class.java) {
            committer.commit(wrongContext.id, wrongContext.contest.id, Attachment.Context.SUBMISSION_CODE)
        }
        assertFalse(wrongContext.isCommited)
        verify(repository, never()).save(wrongContext)
    }
}
