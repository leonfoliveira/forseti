package io.github.leonfoliveira.forseti.api.service

import io.github.leonfoliveira.forseti.api.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.common.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.domain.entity.Member
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.repository.AttachmentRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AttachmentAuthorizationService(
    private val attachmentRepository: AttachmentRepository,
    private val contestAuthFilter: ContestAuthFilter,
) {
    fun authorizeUpload(
        contestId: UUID,
        context: Attachment.Context,
    ) {
        contestAuthFilter.checkIfStarted(contestId)
        val member = RequestContext.getContext().session!!.member
        if (member.type == Member.Type.ROOT) {
            return
        }

        when (context) {
            Attachment.Context.PROBLEM_DESCRIPTION,
            Attachment.Context.PROBLEM_TEST_CASES,
            -> {
                when (member.type) {
                    Member.Type.JUDGE, Member.Type.ADMIN -> contestAuthFilter.checkIfMemberBelongsToContest(contestId)
                    else -> throw ForbiddenException("Only judges and admins can upload $context attachments")
                }
            }
            Attachment.Context.SUBMISSION_CODE -> {
                when (member.type) {
                    Member.Type.CONTESTANT -> contestAuthFilter.checkIfMemberBelongsToContest(contestId)
                    else -> throw ForbiddenException("Only contestants can upload SUBMISSION_CODE attachments")
                }
            }
            else -> throw ForbiddenException("Cannot upload attachments with context $context")
        }
    }

    fun authorizeDownload(
        contestId: UUID,
        attachmentId: UUID,
    ) {
        contestAuthFilter.checkIfStarted(contestId)

        val attachment =
            attachmentRepository.findById(attachmentId).orElseThrow {
                NotFoundException("Could not find attachment with id = $attachmentId")
            }

        if (attachment.contest.id != contestId) {
            throw ForbiddenException("This attachment does not belong to this contest")
        }

        val member = RequestContext.getContext().session?.member
        if (member?.type == Member.Type.ROOT) {
            return
        }

        when (attachment.context) {
            Attachment.Context.PROBLEM_DESCRIPTION -> return
            Attachment.Context.PROBLEM_TEST_CASES -> return
            Attachment.Context.SUBMISSION_CODE -> {
                when (member?.type) {
                    Member.Type.JUDGE, Member.Type.ADMIN -> contestAuthFilter.checkIfMemberBelongsToContest(contestId)
                    Member.Type.CONTESTANT -> {
                        if (attachment.member?.id != member.id) {
                            throw ForbiddenException("Cannot read other members' SUBMISSION_CODE attachments")
                        }
                    }
                    Member.Type.ROOT -> return
                    else -> throw ForbiddenException("Only logged members can read SUBMISSION_CODE attachments")
                }
            }
            else -> throw ForbiddenException("Cannot read ${attachment.context} attachments")
        }
    }
}
