package com.forsetijudge.core.application.helper.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.factory.MockEntityFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class AttachmentAuthorizationConfigTest {
    @Test
    fun `dispatches upload and download authorization by member type`() {
        val config = RecordingAuthorizationConfig()
        val contest = MockEntityFactory.contest()
        val attachment = MockEntityFactory.attachment(contest = contest)

        listOf(
            Member.Type.ROOT to "admin-upload",
            Member.Type.ADMIN to "admin-upload",
            Member.Type.JUDGE to "judge-upload",
            Member.Type.CONTESTANT to "contestant-upload",
        ).forEach { (type, expected) ->
            config.authorizeUpload(contest, MockEntityFactory.member(type = type))
            assertEquals(expected, config.calls.last())
        }
        assertThrows(ForbiddenException::class.java) { config.authorizeUpload(contest, null) }

        listOf(
            Member.Type.ROOT to "admin-download",
            Member.Type.ADMIN to "admin-download",
            Member.Type.JUDGE to "judge-download",
            Member.Type.CONTESTANT to "contestant-download",
        ).forEach { (type, expected) ->
            config.authorizeDownload(contest, MockEntityFactory.member(type = type), attachment)
            assertEquals(expected, config.calls.last())
        }
        config.authorizeDownload(contest, null, attachment)
        assertEquals("guest-download", config.calls.last())
    }

    @Test
    fun `problem description permits staff upload and public download after start`() {
        val config = ProblemDescriptionAuthorizationConfig()
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().minusMinutes(1))
        val attachment = MockEntityFactory.attachment(contest = contest)
        config.authorizeUpload(contest, MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN))
        config.authorizeDownload(
            contest,
            MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE),
            attachment,
        )
        config.authorizeDownload(contest, MockEntityFactory.member(type = Member.Type.CONTESTANT), attachment)
        config.authorizeDownload(contest, null, attachment)

        assertThrows(ForbiddenException::class.java) {
            config.authorizeUpload(contest, MockEntityFactory.member(type = Member.Type.JUDGE))
        }
        assertThrows(ForbiddenException::class.java) {
            config.authorizeUpload(contest, MockEntityFactory.member(type = Member.Type.CONTESTANT))
        }
        assertThrows(ForbiddenException::class.java) {
            config.authorizeDownload(
                MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1)),
                null,
                attachment,
            )
        }
    }

    @Test
    fun `test cases authorization restricts upload and all non-staff downloads`() {
        val config = ProblemTestCasesAuthorizationConfig()
        val contest = MockEntityFactory.contest()
        val attachment = MockEntityFactory.attachment(contest = contest)
        config.authorizeUpload(contest, MockEntityFactory.member(contest = contest, type = Member.Type.ROOT))
        config.authorizeDownload(
            contest,
            MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN),
            attachment,
        )
        config.authorizeDownload(
            contest,
            MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE),
            attachment,
        )

        assertThrows(ForbiddenException::class.java) {
            config.authorizeUpload(contest, MockEntityFactory.member(type = Member.Type.JUDGE))
        }
        assertThrows(ForbiddenException::class.java) {
            config.authorizeUpload(contest, MockEntityFactory.member(type = Member.Type.CONTESTANT))
        }
        assertThrows(ForbiddenException::class.java) {
            config.authorizeDownload(contest, MockEntityFactory.member(type = Member.Type.CONTESTANT), attachment)
        }
        assertThrows(ForbiddenException::class.java) { config.authorizeDownload(contest, null, attachment) }
    }

    @Test
    fun `submission code authorization restricts uploaders and enforces ownership`() {
        val config = SubmissionCodeAuthorizationConfig()
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        val ownAttachment =
            MockEntityFactory.attachment(
                contest = contest,
                member = member,
                context = Attachment.Context.SUBMISSION_CODE,
            )
        config.authorizeUpload(contest, member)
        config.authorizeDownload(
            contest,
            MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE),
            ownAttachment,
        )
        config.authorizeDownload(contest, member, ownAttachment)
        config.authorizeDownload(
            contest,
            MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN),
            ownAttachment,
        )

        assertThrows(ForbiddenException::class.java) {
            config.authorizeUpload(contest, MockEntityFactory.member(type = Member.Type.ADMIN))
        }
        assertThrows(ForbiddenException::class.java) {
            config.authorizeUpload(contest, MockEntityFactory.member(type = Member.Type.JUDGE))
        }
        assertThrows(ForbiddenException::class.java) { config.authorizeDownload(contest, null, ownAttachment) }
        assertThrows(ForbiddenException::class.java) {
            config.authorizeDownload(
                MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1)),
                member,
                ownAttachment,
            )
        }
        assertThrows(ForbiddenException::class.java) {
            config.authorizeDownload(
                contest,
                MockEntityFactory.member(contest = contest),
                ownAttachment,
            )
        }
    }

    private class RecordingAuthorizationConfig : AttachmentAuthorizationConfig() {
        val calls = mutableListOf<String>()

        override fun authorizeAdminUpload(
            contest: Contest,
            member: Member,
        ) {
            calls += "admin-upload"
        }

        override fun authorizeJudgeUpload(
            contest: Contest,
            member: Member,
        ) {
            calls += "judge-upload"
        }

        override fun authorizeContestantUpload(
            contest: Contest,
            member: Member,
        ) {
            calls += "contestant-upload"
        }

        override fun authorizeAdminDownload(
            contest: Contest,
            member: Member,
            attachment: Attachment,
        ) {
            calls += "admin-download"
        }

        override fun authorizeJudgeDownload(
            contest: Contest,
            member: Member,
            attachment: Attachment,
        ) {
            calls += "judge-download"
        }

        override fun authorizeContestantDownload(
            contest: Contest,
            member: Member,
            attachment: Attachment,
        ) {
            calls += "contestant-download"
        }

        override fun authorizeGuestDownload(
            contest: Contest,
            attachment: Attachment,
        ) {
            calls += "guest-download"
        }
    }
}
