package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.service.clarification.DeleteClarificationService
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/clarifications")
class ClarificationController(
    val deleteClarificationService: DeleteClarificationService,
) {
    @DeleteMapping("/{id}")
    @Private(Member.Type.JURY)
    @Transactional(readOnly = true)
    fun deleteClarificationById(
        @PathVariable id: UUID,
    ): ResponseEntity<Unit> {
        deleteClarificationService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
