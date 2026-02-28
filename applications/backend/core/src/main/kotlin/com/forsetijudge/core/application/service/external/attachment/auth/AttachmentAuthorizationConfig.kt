package com.forsetijudge.core.application.service.external.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException

abstract class AttachmentAuthorizationConfig {
    /**
     * Authorizes the upload of an attachment in a contest by a member.
     *
     * @param contest The contest where the attachment is being uploaded.
     * @param member The member attempting the upload, or null if the user is a guest
     * @throws ForbiddenException if the upload is not authorized.
     */
    fun authorizeUpload(
        contest: Contest,
        member: Member?,
    ) {
        when (member?.type) {
            Member.Type.ROOT,
            Member.Type.ADMIN,
            -> authorizeAdminUpload(contest, member)
            Member.Type.STAFF -> authorizeStaffUpload(contest, member)
            Member.Type.JUDGE -> authorizeJudgeUpload(contest, member)
            Member.Type.UNOFFICIAL_CONTESTANT,
            Member.Type.CONTESTANT,
            -> authorizeContestantUpload(contest, member)
            null -> throw ForbiddenException("Guests cannot upload attachments")
            else -> throw ForbiddenException("Members of type ${member.type} cannot upload attachments")
        }
    }

    /** Download authorizations
     *
     * Authorizes the download of an attachment in a contest by a member.
     *
     * @param contest The contest where the attachment is being downloaded.
     * @param member The member attempting the download, or null if the user is a guest
     * @param attachment The attachment being downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizeDownload(
        contest: Contest,
        member: Member?,
        attachment: Attachment,
    ) {
        when (member?.type) {
            Member.Type.ROOT,
            Member.Type.ADMIN,
            -> authorizeAdminDownload(contest, member, attachment)
            Member.Type.STAFF -> authorizeStaffDownload(contest, member, attachment)
            Member.Type.JUDGE -> authorizeJudgeDownload(contest, member, attachment)
            Member.Type.UNOFFICIAL_CONTESTANT,
            Member.Type.CONTESTANT,
            -> authorizeContestantDownload(contest, member, attachment)
            null -> authorizeGuestDownload(contest, attachment)
            else -> throw ForbiddenException("Members of type ${member.type} cannot download attachments")
        }
    }

    // Upload authorizations

    abstract fun authorizeAdminUpload(
        contest: Contest,
        member: Member,
    )

    abstract fun authorizeStaffUpload(
        contest: Contest,
        member: Member,
    )

    abstract fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    )

    abstract fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    )

    // Download authorizations

    abstract fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    abstract fun authorizeStaffDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    abstract fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    abstract fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    abstract fun authorizeGuestDownload(
        contest: Contest,
        attachment: Attachment,
    )
}
