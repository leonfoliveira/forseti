package com.forsetijudge.core.application.service.printrequest

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.PrintRequestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.printrequest.PrintRequestResponseDTO
import com.forsetijudge.core.port.dto.response.printrequest.toResponseDTO
import com.forsetijudge.core.port.input.usecase.printrequest.UpdateIsCompletedPrintRequestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.PrintRequestRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service

@Service
class UpdateIsCompletedPrintRequestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val printRequestRepository: PrintRequestRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : UpdateIsCompletedPrintRequestUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(command: UpdateIsCompletedPrintRequestUseCase.Command): PrintRequestResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Updating isCompleted for PrintRequest with id: ${command.printRequestId} by member with id: $contextMemberId")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Contest with id ${command.contestId} not found")
        val member =
            memberRepository.findByIdAndContestId(contextMemberId, command.contestId)
                ?: throw NotFoundException("Member with id $contextMemberId not found")
        val printRequest =
            printRequestRepository.findByIdAndContestId(command.printRequestId, command.contestId)
                ?: throw NotFoundException("PrintRequest with id ${command.printRequestId} not found")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF)
            .throwIfErrors()

        printRequest.isCompleted = command.isCompleted

        printRequestRepository.save(printRequest)
        businessEventPublisher.publish(PrintRequestEvent.Updated(printRequest.id))

        logger.info("Successfully updated PrintRequest with id: ${command.printRequestId}")
        return printRequest.toResponseDTO()
    }
}
