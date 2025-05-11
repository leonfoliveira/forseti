package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.dto.response.ProblemResponseDTO
import io.leonfoliveira.judge.api.dto.response.toResponseDTO
import io.leonfoliveira.judge.core.service.problem.FindProblemService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/problems")
class ProblemController(
    private val findProblemService: FindProblemService,
) {
    @GetMapping("/{id}")
    fun findAllByContest(
        @PathVariable id: Int,
    ): ResponseEntity<ProblemResponseDTO> {
        val problem = findProblemService.findById(id)
        return ResponseEntity.ok(problem.toResponseDTO())
    }
}
