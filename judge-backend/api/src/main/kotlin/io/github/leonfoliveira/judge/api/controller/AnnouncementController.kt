package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.service.announcement.DeleteAnnouncementService
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/announcements")
class AnnouncementController(
    val deleteAnnouncementService: DeleteAnnouncementService
) {
    @DeleteMapping("/{id}")
    @Private(Member.Type.JURY)
    @Transactional(readOnly = true)
    fun deleteAnnouncement(@PathVariable id: UUID): ResponseEntity<Unit> {
        deleteAnnouncementService.delete(id)
        return ResponseEntity.noContent().build()
    }
}