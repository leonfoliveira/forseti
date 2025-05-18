package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.service.dto.output.SubmissionOutputDTO
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/submissions")
class SubmissionController(
    private val findSubmissionService: FindSubmissionService,
) {
    @GetMapping("/me")
    @Private(Member.Type.CONTESTANT)
    fun findAllForMember(): ResponseEntity<List<SubmissionOutputDTO>> {
        val authorization = AuthorizationContextUtil.getAuthorization()
        val submissions = findSubmissionService.findAllByMember(authorization.id)
        return ResponseEntity.ok(submissions)
    }
}
