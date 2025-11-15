package io.github.leonfoliveira.forseti.common.application.port.driven.repository

import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import java.util.UUID

/**
 * Accessor for persistence operations related to Attachment entity
 */
interface AttachmentRepository : BaseRepository<Attachment> {
    fun findEntityById(id: UUID): Attachment?
}
