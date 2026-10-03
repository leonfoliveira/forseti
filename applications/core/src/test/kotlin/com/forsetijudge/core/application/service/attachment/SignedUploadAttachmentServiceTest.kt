package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.attachment.SignedUploadAttachmentUseCase
import com.forsetijudge.core.port.output.bucket.AttachmentBucket
import com.forsetijudge.core.port.output.repository.AttachmentRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime

class SignedUploadAttachmentServiceTest {
    private val attachments = mock<AttachmentRepository>()
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val bucket = mock<AttachmentBucket>()
    private val service = SignedUploadAttachmentService(attachments, contests, members, bucket)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `creates attachment and returns signed upload url`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        val admin = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
        TestAuthentication.setMember(admin)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(admin.id, contest.id)).thenReturn(admin)
        whenever(bucket.getUploadUrl(any())).thenReturn("https://signed.test/upload")
        val command =
            SignedUploadAttachmentUseCase.Command(
                contest.id,
                filename = "statement.pdf",
                contentType = "application/pdf",
                context = Attachment.Context.PROBLEM_DESCRIPTION,
            )

        val response = service.execute(command)

        assertEquals("https://signed.test/upload", response.uploadUrl)
        verify(attachments).save(any())
        verify(bucket).getUploadUrl(any())
    }

    @Test
    fun `rejects unauthorized context and absent contest`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)
        val command =
            SignedUploadAttachmentUseCase.Command(
                contest.id,
                "statement.pdf",
                "application/pdf",
                Attachment.Context.PROBLEM_DESCRIPTION,
            )
        assertThrows(ForbiddenException::class.java) { service.execute(command) }
        verify(attachments, never()).save(any())

        whenever(contests.findById(contest.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) { service.execute(command) }
    }
}
