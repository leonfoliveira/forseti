package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.dto.response.ProblemResponseDTO
import io.leonfoliveira.judge.api.dto.response.SubmissionResponseDTO
import io.leonfoliveira.judge.api.dto.response.toResponseDTO
import io.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.service.dto.input.CreateSubmissionInputDTO
import io.leonfoliveira.judge.core.service.problem.FindProblemService
import io.leonfoliveira.judge.core.service.submission.CreateSubmissionService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/problems")
class ProblemController(
    private val findProblemService: FindProblemService,
    private val createSubmissionService: CreateSubmissionService,
) {
    @GetMapping("/{id}")
    fun findAllByContest(
        @PathVariable id: Int,
    ): ResponseEntity<ProblemResponseDTO> {
        val problem = findProblemService.findById(id)
        return ResponseEntity.ok(problem.toResponseDTO())
    }

    @PostMapping("/{id}/submissions")
    @Private(Member.Type.CONTESTANT)
    fun createSubmission(
        @PathVariable id: Int,
        @RequestBody input: CreateSubmissionInputDTO,
    ): ResponseEntity<SubmissionResponseDTO> {
        val authentication = AuthorizationContextUtil.getAuthorization()
        val submission =
            createSubmissionService.create(
                memberId = authentication.id,
                problemId = id,
                inputDTO = input,
            )
        return ResponseEntity.ok(submission.toResponseDTO())
    }
}
