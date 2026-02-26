package com.forsetijudge.api.adapter.driving.http.controller.ppublic

import com.forsetijudge.core.port.driving.usecase.external.contest.FindContestBySlugUseCase
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class PublicContestController(
    private val findContestBySlugUseCase: FindContestBySlugUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/public/contests/slug/{slug}")
    fun findBySlug(
        @PathVariable slug: String,
    ): ResponseEntity<ContestResponseBodyDTO> {
        logger.info("[GET] /v1/public/contests/slug/$slug")
        val contest =
            findContestBySlugUseCase.execute(
                FindContestBySlugUseCase.Command(slug = slug),
            )
        return ResponseEntity.ok(contest.toResponseBodyDTO())
    }
}
