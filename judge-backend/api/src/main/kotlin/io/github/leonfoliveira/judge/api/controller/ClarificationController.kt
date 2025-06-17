package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.service.clarification.DeleteClarificationService
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/clarifications")
class ClarificationController(
    val deleteClarificationService: DeleteClarificationService,
) {
    @GetMapping("/{id}")
    @Private(Member.Type.JURY)
    @Transactional(readOnly = true)
    fun deleteClarifications(@PathVariable id: UUID): ResponseEntity<Unit> {
        deleteClarificationService.delete(id)
        return ResponseEntity.noContent().build()
    }
}