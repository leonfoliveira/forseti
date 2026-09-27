package com.forsetijudge.core.application.helper.attachment.auth

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

            Member.Type.JUDGE -> authorizeJudgeUpload(contest, member)

            Member.Type.CONTESTANT,
            -> authorizeContestantUpload(contest, member)

            null -> throw ForbiddenException("Guests cannot upload attachments")
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

            Member.Type.JUDGE -> authorizeJudgeDownload(contest, member, attachment)

            Member.Type.CONTESTANT,
            -> authorizeContestantDownload(contest, member, attachment)

            null -> authorizeGuestDownload(contest, attachment)
        }
    }

    // Upload authorizations

    /**
     * Authorizes the upload of an attachment in a contest by an admin member.
     *
     * @param contest The contest where the attachment is being uploaded.
     * @param member The admin member attempting the upload.
     * @throws ForbiddenException if the upload is not authorized.
     */
    abstract fun authorizeAdminUpload(
        contest: Contest,
        member: Member,
    )

    /**
     * Authorizes the upload of an attachment in a contest by a judge member.
     *
     * @param contest The contest where the attachment is being uploaded.
     * @param member The judge member attempting the upload.
     * @throws ForbiddenException if the upload is not authorized.
     */
    abstract fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    )

    /**
     * Authorizes the upload of an attachment in a contest by a contestant member.
     *
     * @param contest The contest where the attachment is being uploaded.
     * @param member The contestant member attempting the upload.
     * @throws ForbiddenException if the upload is not authorized.
     */
    abstract fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    )

    // Download authorizations

    /**
     * Authorizes the download of an attachment in a contest by an admin member.
     *
     * @param contest The contest where the attachment is being downloaded.
     * @param member The admin member attempting the download.
     * @param attachment The attachment being downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    abstract fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    /**
     * Authorizes the download of an attachment in a contest by a judge member.
     *
     * @param contest The contest where the attachment is being downloaded.
     * @param member The judge member attempting the download.
     * @param attachment The attachment being downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    abstract fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    /**
     * Authorizes the download of an attachment in a contest by a contestant member.
     *
     * @param contest The contest where the attachment is being downloaded.
     * @param member The contestant member attempting the download.
     * @param attachment The attachment being downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    abstract fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    /**
     * Authorizes the download of an attachment in a contest by a guest user.
     *
     * @param contest The contest where the attachment is being downloaded.
     * @param attachment The attachment being downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    abstract fun authorizeGuestDownload(
        contest: Contest,
        attachment: Attachment,
    )
}
