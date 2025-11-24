package live.forseti.api.adapter.dto.response.announcement

import live.forseti.api.adapter.dto.response.member.MemberPublicResponseDTO
import live.forseti.api.adapter.dto.response.member.toPublicResponseDTO
import live.forseti.core.domain.entity.Announcement
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class AnnouncementResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val member: MemberPublicResponseDTO,
    val text: String,
) : Serializable

fun Announcement.toResponseDTO(): AnnouncementResponseDTO =
    AnnouncementResponseDTO(
        id = this.id,
        createdAt = this.createdAt,
        member = this.member.toPublicResponseDTO(),
        text = this.text,
    )
