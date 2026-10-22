package com.forsetijudge.core.application.service.printrequest

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.PrintRequest
import com.forsetijudge.core.domain.event.PrintRequestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.printrequest.PrintRequestResponseDTO
import com.forsetijudge.core.port.dto.response.printrequest.toResponseDTO
import com.forsetijudge.core.port.input.usecase.printrequest.CreatePrintRequestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.PrintRequestRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CreatePrintRequestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val printRequestRepository: PrintRequestRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : CreatePrintRequestUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(command: CreatePrintRequestUseCase.Command): PrintRequestResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Creating PrintRequest for submission with id: ${command.submissionId} by member with id: $contextMemberId")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Contest with id ${command.contestId} not found")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Member with id $contextMemberId not found")
        val submission =
            submissionRepository.findByIdAndContestId(command.submissionId, command.contestId)
                ?: throw NotFoundException("Submission with id ${command.submissionId} not found")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.CONTESTANT)
            .requireContestActive()
            .throwIfErrors()

        if (submission.member != member) {
            throw ForbiddenException("Submission with id ${command.submissionId} does not belong to member with id $contextMemberId")
        }

        val printRequest =
            PrintRequest(
                submission = submission,
            )

        printRequestRepository.save(printRequest)
        businessEventPublisher.publish(PrintRequestEvent.Created(printRequest.id))

        logger.info("Successfully created PrintRequest with id: ${printRequest.id}")
        return printRequest.toResponseDTO()
    }
}
