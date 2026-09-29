package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.http.dto.request.contest.CreateContestRequestBodyDTO
import com.forsetijudge.core.api.http.dto.request.contest.UpdateContestRequestBodyDTO
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.CreateContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.DeleteContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.FindAllContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.FindContestBySlugUseCase
import com.forsetijudge.core.port.input.usecase.contest.ForceEndContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.ForceStartContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.UpdateContestUseCase
import com.forsetijudge.core.util.SafeLogger
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ContestController(
    private val findContestBySlugUseCase: FindContestBySlugUseCase,
    private val findAllContestUseCase: FindAllContestUseCase,
    private val createContestUseCase: CreateContestUseCase,
    private val updateContestUseCase: UpdateContestUseCase,
    private val forceStartContestUseCase: ForceStartContestUseCase,
    private val forceEndContestUseCase: ForceEndContestUseCase,
    private val deleteContestUseCase: DeleteContestUseCase,
) {
    private val logger = SafeLogger(this::class)

    @GetMapping("/contests/slug/{slug}")
    fun findBySlug(
        @PathVariable slug: String,
    ): ResponseEntity<ContestResponseBodyDTO> {
        logger.info("[GET] /v1/contests/slug/$slug")
        val contest =
            findContestBySlugUseCase.execute(
                FindContestBySlugUseCase.Command(slug = slug),
            )
        return ResponseEntity.ok(contest)
    }

    @GetMapping("/contests")
    @PreAuthorize("hasRole('ROOT')")
    fun findAll(): ResponseEntity<List<ContestResponseBodyDTO>> {
        logger.info("[GET] /v1/contests")
        val contests = findAllContestUseCase.execute()
        return ResponseEntity.ok(contests)
    }

    @PostMapping("/contests")
    @PreAuthorize("hasRole('ROOT')")
    fun create(
        @RequestBody body: CreateContestRequestBodyDTO,
    ): ResponseEntity<ContestResponseBodyDTO> {
        logger.info("[POST] /v1/contests")
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
        return ResponseEntity.ok(contest)
    }

    @PutMapping("/contests/{contestId}")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN')")
    fun updateContest(
        @PathVariable contestId: UUID,
        @RequestBody body: UpdateContestRequestBodyDTO,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId")
        val contest =
            updateContestUseCase.execute(
                UpdateContestUseCase.Command(
                    contestId = contestId,
                    slug = body.slug,
                    title = body.title,
                    languages = body.languages,
                    startAt = body.startAt,
                    endAt = body.endAt,
                    autoFreezeAt = body.autoFreezeAt,
                    settings =
                        UpdateContestUseCase.Command.Settings(
                            isAutoJudgeEnabled = body.settings.isAutoJudgeEnabled,
                            isClarificationEnabled = body.settings.isClarificationEnabled,
                            isSubmissionPrintTicketEnabled = body.settings.isSubmissionPrintTicketEnabled,
                            isTechnicalSupportTicketEnabled = body.settings.isTechnicalSupportTicketEnabled,
                            isNonTechnicalSupportTicketEnabled = body.settings.isNonTechnicalSupportTicketEnabled,
                            isGuestEnabled = body.settings.isGuestEnabled,
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
        return ResponseEntity.ok(contest)
    }

    @PutMapping("/contests/{contestId}:force-start")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN')")
    fun forceStart(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId:force-start")
        val contest =
            forceStartContestUseCase.execute(
                ForceStartContestUseCase.Command(contestId),
            )
        return ResponseEntity.ok(contest)
    }

    @PutMapping("/contests/{contestId}:force-end")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN')")
    fun forceEnd(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId:force-end")
        val contest =
            forceEndContestUseCase.execute(
                ForceEndContestUseCase.Command(contestId),
            )
        return ResponseEntity.ok(contest)
    }

    @DeleteMapping("/contests/{contestId}")
    @PreAuthorize("hasRole('ROOT')")
    fun delete(
        @PathVariable contestId: UUID,
    ): ResponseEntity<Void> {
        logger.info("[DELETE] /v1/contests/$contestId")
        deleteContestUseCase.execute(
            DeleteContestUseCase.Command(contestId),
        )
        return ResponseEntity.noContent().build()
    }
}
