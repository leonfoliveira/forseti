package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Member
import java.util.UUID

interface AttachmentAuthorizationConfig {
    /**
     * Returns the context of the attachment this config handles.
     */
    fun getContext(): Attachment.Context

    // Upload authorizations

    /**
     * Authorizes the upload of an attachment in a contest by an admin member.
     *
     * @param contestId The ID of the contest.
     * @param member The admin member attempting the upload.
     * @throws ForbiddenException if the upload is not authorized.
     */
    fun authorizeAdminUpload(
        contestId: UUID,
        member: Member,
    )

    /**
     * Authorizes the upload of an attachment in a contest by a judge member.
     *
     * @param contestId The ID of the contest.
     * @param member The judge member attempting the upload.
     * @throws ForbiddenException if the upload is not authorized.
     */
    fun authorizeJudgeUpload(
        contestId: UUID,
        member: Member,
    )

    /**
     * Authorizes the upload of an attachment in a contest by a contestant member.
     *
     * @param contestId The ID of the contest.
     * @param member The contestant member attempting the upload.
     * @throws ForbiddenException if the upload is not authorized.
     */
    fun authorizeContestantUpload(
        contestId: UUID,
        member: Member,
    )

    /**
     * Authorizes the upload of an attachment in a contest by a public (guest) user.
     *
     * @param contestId The ID of the contest.
     * @throws ForbiddenException if the upload is not authorized.
     */
    fun authorizePublicUpload(contestId: UUID)

    // Download authorizations

    /**
     * Authorizes the download of an attachment in a contest by an admin member.
     *
     * @param contestId The ID of the contest.
     * @param member The admin member attempting the download.
     * @param attachment The attachment to be downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizeAdminDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    )

    /**
     * Authorizes the download of an attachment in a contest by a judge member.
     *
     * @param contestId The ID of the contest.
     * @param member The judge member attempting the download.
     * @param attachment The attachment to be downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizeJudgeDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    )

    /**
     * Authorizes the download of an attachment in a contest by a contestant member.
     *
     * @param contestId The ID of the contest.
     * @param member The contestant member attempting the download.
     * @param attachment The attachment to be downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizeContestantDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    )

    /**
     * Authorizes the download of an attachment in a contest by a public (guest) user.
     *
     * @param contestId The ID of the contest.
     * @param attachment The attachment to be downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizePublicDownload(
        contestId: UUID,
        attachment: Attachment,
    )
}
