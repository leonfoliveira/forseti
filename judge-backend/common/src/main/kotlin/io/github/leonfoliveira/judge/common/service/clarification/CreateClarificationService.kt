package io.github.leonfoliveira.judge.common.service.clarification

import io.github.leonfoliveira.judge.common.domain.entity.Clarification
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.event.ClarificationEvent
import io.github.leonfoliveira.judge.common.repository.ClarificationRepository
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.service.dto.input.clarification.CreateClarificationInputDTO
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CreateClarificationService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val clarificationRepository: ClarificationRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateClarificationInputDTO,
    ): Clarification {
        logger.info("Creating clarification for contest with id: $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id $contestId")
            }
        val member =
            memberRepository.findById(memberId).orElseThrow {
                NotFoundException("Could not find member with id $memberId")
            }

        if (member.type == Member.Type.CONTESTANT && input.parentId != null) {
            throw ForbiddenException("Contestants cannot create clarifications with a parent")
        }
        if (setOf(Member.Type.JUDGE, Member.Type.ADMIN).contains(member.type) && input.parentId == null) {
            throw ForbiddenException("${member.type} members cannot create clarifications without a parent")
        }

        val problem =
            input.problemId?.let {
                contest.problems.find { it.id == input.problemId }
                    ?: throw NotFoundException("Could not find problem with id ${input.problemId} in contest $contestId")
            }
        val parent =
            input.parentId?.let {
                clarificationRepository.findById(it).orElseThrow {
                    NotFoundException("Could not find parent announcement with id $it")
                }
            }

        val clarification =
            Clarification(
                contest = contest,
                member = member,
                text = input.text,
                problem = problem,
                parent = parent,
            )
        clarificationRepository.save(clarification)
        applicationEventPublisher.publishEvent(ClarificationEvent(this, clarification))
        logger.info("Clarification created successfully")
        return clarification
    }
}
