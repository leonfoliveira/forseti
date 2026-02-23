package com.forsetijudge.api.adapter.driving.controller.root

import com.forsetijudge.api.adapter.dto.request.contest.CreateContestRequestBodyDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.contest.CreateContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.FindAllContestUseCase
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
class RootContestController(
    private val createContestUseCase: CreateContestUseCase,
    private val findAllContestUseCase: FindAllContestUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/root/contests")
    @Private(Member.Type.ROOT)
    fun create(
        @RequestBody body: CreateContestRequestBodyDTO,
    ): ResponseEntity<ContestResponseBodyDTO> {
        logger.info("[POST] /v1/root/contests")
        val contest =
            createContestUseCase.execute(
                CreateContestUseCase.Command(
                    slug = body.slug,
                    title = body.title,
                    languages = body.languages,
                    startAt = body.startAt,
                    endAt = body.endAt,
                ),
            )
        return ResponseEntity.ok(contest.toResponseBodyDTO())
    }

    @GetMapping("/root/contests")
    @Private(Member.Type.ROOT)
    fun findAll(): ResponseEntity<List<ContestResponseBodyDTO>> {
        logger.info("[GET] /v1/root/contests")
        val contests = findAllContestUseCase.execute()
        return ResponseEntity.ok(contests.map { it.toResponseBodyDTO() })
    }
}
