package io.github.leonfoliveira.forseti.api.application.service.attachment.config

import io.github.leonfoliveira.forseti.api.adapter.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.api.application.service.attachment.AttachmentAuthorizationConfig
import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ProblemTestCasesAuthorizationConfig(
    private val contestAuthFilter: ContestAuthFilter,
) : AttachmentAuthorizationConfig {
    override fun getContext(): Attachment.Context = Attachment.Context.PROBLEM_TEST_CASES

    override fun authorizeAdminUpload(
        contestId: UUID,
        member: Member,
    ) {
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
    }

    override fun authorizeJudgeUpload(
        contestId: UUID,
        member: Member,
    ) = throw ForbiddenException("Judges cannot upload test cases description attachments")

    override fun authorizeContestantUpload(
        contestId: UUID,
        member: Member,
    ) = throw ForbiddenException("Contestants cannot upload test cases description attachments")

    override fun authorizePublicUpload(contestId: UUID): Unit =
        throw ForbiddenException("Guest users cannot upload test cases description attachments")

    override fun authorizeAdminDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    ) {
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
    }

    override fun authorizeJudgeDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Judges cannot download test cases description attachments")

    override fun authorizeContestantDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Contestants cannot download test cases description attachments")

    override fun authorizePublicDownload(
        contestId: UUID,
        attachment: Attachment,
    ) = throw ForbiddenException("Guest users cannot download test cases description attachments")
}
