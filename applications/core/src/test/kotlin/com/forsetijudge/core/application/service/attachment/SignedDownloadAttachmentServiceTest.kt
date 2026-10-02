package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.attachment.SignedDownloadAttachmentUseCase
import com.forsetijudge.core.port.output.bucket.AttachmentBucket
import com.forsetijudge.core.port.output.repository.AttachmentRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.test.factory.MockEntityFactory
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class SignedDownloadAttachmentServiceTest {
    private val members = mock<MemberRepository>()
    private val attachments = mock<AttachmentRepository>()
    private val bucket = mock<AttachmentBucket>()
    private val service = SignedDownloadAttachmentService(members, attachments, bucket)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `returns signed download for public problem description`() {
        TestAuthentication.clear()
        val contest = MockEntityFactory.contest()
        val attachment =
            MockEntityFactory.attachment(
                contest = contest,
                context = Attachment.Context.PROBLEM_DESCRIPTION,
                contentType = "application/pdf",
            )
        whenever(attachments.findByIdAndContestId(attachment.id, contest.id)).thenReturn(attachment)
        whenever(bucket.getDownloadUrl(attachment)).thenReturn("https://signed.test/download")

        val response =
            service.execute(SignedDownloadAttachmentUseCase.Command(contest.id, attachment.id))

        assertEquals("https://signed.test/download", response.downloadUrl)
        verify(bucket).getDownloadUrl(attachment)
    }

    @Test
    fun `rejects guests for restricted context and missing attachment`() {
        TestAuthentication.clear()
        val contest = MockEntityFactory.contest()
        val attachment =
            MockEntityFactory.attachment(
                contest = contest,
                context = Attachment.Context.PROBLEM_TEST_CASES,
            )
        whenever(attachments.findByIdAndContestId(attachment.id, contest.id)).thenReturn(attachment)
        assertThrows(ForbiddenException::class.java) {
            service.execute(SignedDownloadAttachmentUseCase.Command(contest.id, attachment.id))
        }
        verify(bucket, never()).getDownloadUrl(any())

        whenever(attachments.findByIdAndContestId(attachment.id, contest.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(SignedDownloadAttachmentUseCase.Command(contest.id, attachment.id))
        }
    }
}
