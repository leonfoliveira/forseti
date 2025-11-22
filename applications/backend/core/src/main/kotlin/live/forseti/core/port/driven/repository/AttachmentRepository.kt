package live.forseti.core.port.driven.repository

import live.forseti.core.domain.entity.Attachment
import java.util.UUID

/**
 * Accessor for persistence operations related to Attachment entity
 */
interface AttachmentRepository : BaseRepository<Attachment> {
    fun findEntityById(id: UUID): Attachment?
}
