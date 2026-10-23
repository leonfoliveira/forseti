package com.forsetijudge.core.api.listener.printrequest

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.PrintRequestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.printrequest.toResponseDTO
import com.forsetijudge.core.port.output.repository.PrintRequestRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiPrintRequestCreatedEventListener(
    private val printRequestRepository: PrintRequestRepository,
    private val sseFanoutRedisMessageProducer: SSEFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    fun handle(event: PrintRequestEvent.Created) {
        logger.info("Handling print request created event for print request with id: ${event.printRequestId}")

        val printRequest =
            printRequestRepository.findByIdNullable(event.printRequestId)
                ?: throw NotFoundException("Could not find print request with id: ${event.printRequestId}")
        val member = printRequest.submission.member

        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildAdminDashboardRoom(printRequest.id),
                eventName = SSE.PRINT_REQUEST_CREATED.name,
                data = printRequest.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildStaffDashboardRoom(printRequest.id),
                eventName = SSE.PRINT_REQUEST_CREATED.name,
                data = printRequest.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildMemberPrivateRoom(member.id),
                eventName = SSE.PRINT_REQUEST_CREATED.name,
                data = printRequest.toResponseDTO(),
            ),
        )
    }
}
