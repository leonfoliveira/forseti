package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.api.adapter.dto.request.contest.UpdateContestRequestBodyDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.contest.DeleteContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.FindContestBySlugUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.ForceEndContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.ForceStartContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.UpdateContestUseCase
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
class ContestController(
    private val findContestBySlugUseCase: FindContestBySlugUseCase,
    private val updateContestUseCase: UpdateContestUseCase,
    private val forceStartContestUseCase: ForceStartContestUseCase,
    private val forceEndContestUseCase: ForceEndContestUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/contests/slug/{slug}")
    fun findBySlug(
        @PathVariable slug: String,
    ): ResponseEntity<ContestResponseBodyDTO> {
        logger.info("[GET] /v1/contests/slug/$slug")
        val contest =
            findContestBySlugUseCase.execute(
                FindContestBySlugUseCase.Command(slug = slug),
            )
        return ResponseEntity.ok(contest.toResponseBodyDTO())
    }

    @PutMapping("/contests/{contestId}")
    @Private(Member.Type.ROOT, Member.Type.ADMIN)
    fun updateContest(
        @PathVariable contestId: UUID,
        @RequestBody body: UpdateContestRequestBodyDTO,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId")
        val contest =
            updateContestUseCase.execute(
                UpdateContestUseCase.Command(
                    slug = body.slug,
                    title = body.title,
                    languages = body.languages,
                    startAt = body.startAt,
                    endAt = body.endAt,
                    autoFreezeAt = body.autoFreezeAt,
                    settings =
                        UpdateContestUseCase.Command.Settings(
                            isAutoJudgeEnabled = body.settings.isAutoJudgeEnabled,
                        ),
                    members =
                        body.members.map {
                            UpdateContestUseCase.Command.Member(
                                id = it.id,
                                type = it.type,
                                name = it.name,
                                login = it.login,
                                password = it.password,
                            )
                        },
                    problems =
                        body.problems.map {
                            UpdateContestUseCase.Command.Problem(
                                id = it.id,
                                letter = it.letter,
                                color = it.color,
                                title = it.title,
                                description =
                                    AttachmentCommandDTO(
                                        id = it.description.id,
                                    ),
                                timeLimit = it.timeLimit,
                                memoryLimit = it.memoryLimit,
                                testCases =
                                    AttachmentCommandDTO(
                                        id = it.testCases.id,
                                    ),
                            )
                        },
                ),
            )
        return ResponseEntity.ok(contest.toWithMembersAndProblemsResponseBodyDTO())
    }

    @PutMapping("/contests/{contestId}:force-start")
    @Private(Member.Type.ROOT, Member.Type.ADMIN)
    fun forceStart(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId:force-start")
        val contest = forceStartContestUseCase.execute()
        return ResponseEntity.ok(contest.toWithMembersAndProblemsResponseBodyDTO())
    }

    @PutMapping("/contests/{contestId}:force-end")
    @Private(Member.Type.ROOT, Member.Type.ADMIN)
    fun forceEnd(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId:force-end")
        val contest = forceEndContestUseCase.execute()
        return ResponseEntity.ok(contest.toWithMembersAndProblemsResponseBodyDTO())
    }
}
