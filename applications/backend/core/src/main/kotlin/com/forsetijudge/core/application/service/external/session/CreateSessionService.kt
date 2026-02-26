package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.session.CreateSessionUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.CreateSessionInternalUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CreateSessionService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val createSessionInternalUseCase: CreateSessionInternalUseCase,
) : CreateSessionUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional
    override fun execute(command: CreateSessionUseCase.Command): Session {
        logger.info("Creating session for member with id: ${command.memberId} and contest with id: ${command.contestId}")

        val contest =
            command.contestId?.let {
                contestRepository.findById(it)
                    ?: throw NotFoundException("Could not found contest with id: ${command.contestId}")
            }
        val member =
            if (contest != null) {
                memberRepository.findByIdAndContestIdOrContestIsNull(command.memberId, contest.id)
                    ?: throw NotFoundException("Could not found member with id: ${command.memberId} in contest with id: ${contest.id}")
            } else {
                memberRepository.findByIdAndContestIsNull(command.memberId)
                    ?: throw NotFoundException("Could not found member with id: ${command.memberId} without contest")
            }

        val session =
            createSessionInternalUseCase.execute(
                CreateSessionInternalUseCase.Command(
                    member = member,
                    contest = contest,
                ),
            )

        logger.info("Session created successfully with id: ${session.id}")
        return session
    }
}
