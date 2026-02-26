package com.forsetijudge.api.adapter.driving.http.controller.contests

import com.forsetijudge.api.adapter.dto.request.contest.UpdateContestRequestBodyDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.contest.ForceEndContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.ForceStartContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.UpdateContestUseCase
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ContestController(
    private val updateContestUseCase: UpdateContestUseCase,
    private val forceStartContestUseCase: ForceStartContestUseCase,
    private val forceEndContestUseCase: ForceEndContestUseCase,
) {
    private val logger = SafeLogger(this::class)

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
