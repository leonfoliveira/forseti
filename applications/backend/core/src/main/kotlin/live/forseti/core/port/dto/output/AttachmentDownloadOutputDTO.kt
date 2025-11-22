package live.forseti.core.port.dto.output

import live.forseti.core.domain.entity.Attachment

class AttachmentDownloadOutputDTO(
    val attachment: Attachment,
    val bytes: ByteArray,
)
