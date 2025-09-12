package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AttachmentAuthorizationService(
    private val attachmentRepository: AttachmentRepository,
    private val contestAuthFilter: ContestAuthFilter,
) {
    fun authorize(attachmentId: UUID) {
        val attachment =
            attachmentRepository.findById(attachmentId).orElseThrow {
                NotFoundException("Could not find attachment with id = $attachmentId")
            }
    }

    private fun authorizeProblemDescription(attachment: Attachment) {
    }
}
