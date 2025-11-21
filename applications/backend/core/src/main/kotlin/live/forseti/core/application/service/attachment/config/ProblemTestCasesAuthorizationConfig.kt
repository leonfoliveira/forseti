package live.forseti.core.application.service.attachment.config

import live.forseti.core.application.service.attachment.AttachmentAuthorizationConfig
import live.forseti.core.application.service.contest.AuthorizeContestService
import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.exception.ForbiddenException
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ProblemTestCasesAuthorizationConfig(
    private val authorizeContestService: AuthorizeContestService,
) : AttachmentAuthorizationConfig {
    override fun getContext(): Attachment.Context = Attachment.Context.PROBLEM_TEST_CASES

    override fun authorizeAdminUpload(
        contestId: UUID,
        member: Member,
    ) {
        authorizeContestService.checkIfMemberBelongsToContest(contestId)
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
        authorizeContestService.checkIfMemberBelongsToContest(contestId)
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
