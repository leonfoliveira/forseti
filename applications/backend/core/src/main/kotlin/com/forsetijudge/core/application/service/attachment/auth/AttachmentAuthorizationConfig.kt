package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member

interface AttachmentAuthorizationConfig {
    /**
     * Returns the context of the attachment this config handles.
     */
    fun getContext(): Attachment.Context

    // Upload authorizations

    /**
     * Authorizes the upload of an attachment in a contest by an admin member.
     *
     * @param contest The contest where the attachment is being uploaded.
     * @param member The admin member attempting the upload.
     * @throws ForbiddenException if the upload is not authorized.
     */
    fun authorizeAdminUpload(
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
    fun authorizeJudgeUpload(
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
    fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    )

    /**
     * Authorizes the upload of an attachment in a contest by a public (guest) user.
     *
     * @param contest The contest where the attachment is being uploaded.
     * @throws ForbiddenException if the upload is not authorized.
     */
    fun authorizePublicUpload(contest: Contest)

    // Download authorizations

    /**
     * Authorizes the download of an attachment in a contest by an admin member.
     *
     * @param contest The contest where the attachment is being downloaded.
     * @param member The admin member attempting the download.
     * @param attachment The attachment to be downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    /**
     * Authorizes the download of an attachment in a contest by a judge member.
     *
     * @param contest The contest where the attachment is being downloaded.
     * @param member The judge member attempting the download.
     * @param attachment The attachment to be downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    /**
     * Authorizes the download of an attachment in a contest by a contestant member.
     *
     * @param contest The contest where the attachment is being downloaded.
     * @param member The contestant member attempting the download.
     * @param attachment The attachment to be downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    )

    /**
     * Authorizes the download of an attachment in a contest by a public (guest) user.
     *
     * @param contest The contest where the attachment is being downloaded.
     * @param attachment The attachment to be downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizePublicDownload(
        contest: Contest,
        attachment: Attachment,
    )
}
