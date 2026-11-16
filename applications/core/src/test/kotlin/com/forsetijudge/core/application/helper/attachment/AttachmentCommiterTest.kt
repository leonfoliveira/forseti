package com.forsetijudge.core.application.helper.attachment

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.repository.AttachmentRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class AttachmentCommiterTest {
    private val attachmentRepository = mock<AttachmentRepository>()
    private val attachmentCommitter = AttachmentCommiter(attachmentRepository)

    private val attachmentId = IdGenerator.getUUID()
    private val contestId = IdGenerator.getUUID()
    private val context = Attachment.Context.SUBMISSION_CODE

    @Test
    fun `should throw NotFoundException when attachment is not found`() {
        whenever(attachmentRepository.findByIdAndContestId(attachmentId, contestId)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            attachmentCommitter.commit(attachmentId, contestId, context)
        }
    }

    @Test
    fun `should throw ConflictException when attachment is already committed`() {
        val attachment = MockEntityFactory.attachment(isCommited = true, context = context)
        whenever(attachmentRepository.findByIdAndContestId(attachmentId, contestId)).thenReturn(attachment)

        assertThrows(ConflictException::class.java) {
            attachmentCommitter.commit(attachmentId, contestId, context)
        }
    }

    @Test
    fun `should throw ForbiddenException when attachment context is invalid`() {
        val attachment = MockEntityFactory.attachment(context = Attachment.Context.PROBLEM_DESCRIPTION)
        whenever(attachmentRepository.findByIdAndContestId(attachmentId, contestId)).thenReturn(attachment)

        assertThrows(ForbiddenException::class.java) {
            attachmentCommitter.commit(attachmentId, contestId, context)
        }
    }

    @Test
    fun `should commit attachment successfully`() {
        val attachment = MockEntityFactory.attachment(context = context)
        whenever(attachmentRepository.findByIdAndContestId(attachmentId, contestId)).thenReturn(attachment)

        val committedAttachment = attachmentCommitter.commit(attachmentId, contestId, context)

        assertTrue(committedAttachment.isCommited)
        verify(attachmentRepository).saveAndFlush(committedAttachment)
    }
}
