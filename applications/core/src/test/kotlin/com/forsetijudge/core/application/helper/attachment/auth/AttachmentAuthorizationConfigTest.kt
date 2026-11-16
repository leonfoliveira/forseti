package com.forsetijudge.core.application.helper.attachment.auth

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.factory.MockEntityFactory
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.spy
import org.mockito.kotlin.verify

class AttachmentAuthorizationConfigTest {
    private val configSpy = spy<AttachmentAuthorizationConfig>()

    @Test
    fun `authorizeUpload should call the correct method based on member type`() {
        val contest = MockEntityFactory.contest()
        val rootMember = MockEntityFactory.member(type = Member.Type.ROOT)
        val adminMember = MockEntityFactory.member(type = Member.Type.ADMIN)
        val judgeMember = MockEntityFactory.member(type = Member.Type.JUDGE)
        val staffMember = MockEntityFactory.member(type = Member.Type.STAFF)
        val contestantMember = MockEntityFactory.member(type = Member.Type.CONTESTANT)
        val unofficialContestantMember = MockEntityFactory.member(type = Member.Type.UNOFFICIAL_CONTESTANT)

        configSpy.authorizeUpload(contest, rootMember)
        verify(configSpy).authorizeAdminUpload(contest, rootMember)

        configSpy.authorizeUpload(contest, adminMember)
        verify(configSpy).authorizeAdminUpload(contest, adminMember)

        configSpy.authorizeUpload(contest, judgeMember)
        verify(configSpy).authorizeJudgeUpload(contest, judgeMember)

        configSpy.authorizeUpload(contest, staffMember)
        verify(configSpy).authorizeStaffUpload(contest, staffMember)

        configSpy.authorizeUpload(contest, contestantMember)
        verify(configSpy).authorizeContestantUpload(contest, contestantMember)

        configSpy.authorizeUpload(contest, unofficialContestantMember)
        verify(configSpy).authorizeContestantUpload(contest, unofficialContestantMember)

        assertThrows<ForbiddenException> {
            configSpy.authorizeUpload(contest, null)
        }
    }

    @Test
    fun `authorizeDownload should call the correct method based on member type`() {
        val contest = MockEntityFactory.contest()
        val attachment = MockEntityFactory.attachment(contest = contest)
        val rootMember = MockEntityFactory.member(type = Member.Type.ROOT)
        val adminMember = MockEntityFactory.member(type = Member.Type.ADMIN)
        val judgeMember = MockEntityFactory.member(type = Member.Type.JUDGE)
        val staffMember = MockEntityFactory.member(type = Member.Type.STAFF)
        val contestantMember = MockEntityFactory.member(type = Member.Type.CONTESTANT)
        val unofficialContestantMember = MockEntityFactory.member(type = Member.Type.UNOFFICIAL_CONTESTANT)

        configSpy.authorizeDownload(contest, rootMember, attachment)
        verify(configSpy).authorizeAdminDownload(contest, rootMember, attachment)

        configSpy.authorizeDownload(contest, adminMember, attachment)
        verify(configSpy).authorizeAdminDownload(contest, adminMember, attachment)

        configSpy.authorizeDownload(contest, judgeMember, attachment)
        verify(configSpy).authorizeJudgeDownload(contest, judgeMember, attachment)

        configSpy.authorizeDownload(contest, staffMember, attachment)
        verify(configSpy).authorizeStaffDownload(contest, staffMember, attachment)

        configSpy.authorizeDownload(contest, contestantMember, attachment)
        verify(configSpy).authorizeContestantDownload(contest, contestantMember, attachment)

        configSpy.authorizeDownload(contest, unofficialContestantMember, attachment)
        verify(configSpy).authorizeContestantDownload(contest, unofficialContestantMember, attachment)

        configSpy.authorizeDownload(contest, null, attachment)
        verify(configSpy).authorizeSpectatorDownload(contest, attachment)
    }
}
