package com.forsetijudge.infrastructure.adapter.driving.job

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import org.quartz.DisallowConcurrentExecution
import org.quartz.JobExecutionContext
import org.quartz.JobExecutionException
import org.quartz.PersistJobDataAfterExecution
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.quartz.QuartzJobBean
import java.io.Serializable
import java.util.UUID

@PersistJobDataAfterExecution
@DisallowConcurrentExecution
abstract class QuartzJob<TPayload : Serializable> : QuartzJobBean() {
    @Value("\${security.member-login}")
    private lateinit var memberLogin: String

    @Value("\${security.member-type}")
    private lateinit var memberType: Member.Type

    @Autowired
    private lateinit var authenticateSystemUseCase: AuthenticateSystemUseCase

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Value("\${spring.quartz.max-retries}")
    private lateinit var maxRetries: Integer

    protected val logger = SafeLogger(this::class)

    /**
     * Executes the job and handles any exceptions that may occur during execution.
     * If an exception is thrown, it will be wrapped in a JobExecutionException and the job will be refired immediately.
     *
     * @param context The JobExecutionContext provided by the Quartz scheduler, containing information about the job execution environment.
     */
    public override fun executeInternal(context: JobExecutionContext) {
        ExecutionContext.start()

        val dataMap = context.mergedJobDataMap
        val id = dataMap.getString("id")
        val contestId =
            if (!(dataMap.get("contestId") as? String).isNullOrEmpty()) {
                UUID.fromString(dataMap.getString("contestId"))
            } else {
                null
            }
        val payloadJson = dataMap.getString("payload")
        var retries = dataMap.getInt("retries")

        val payload = objectMapper.readValue(payloadJson, getPayloadType())

        ExecutionContext.get().contestId = contestId

        authenticateSystemUseCase.execute(
            AuthenticateSystemUseCase.Command(
                login = memberLogin,
                type = memberType,
            ),
        )

        logger.info("Job id: $id, payload: $payload, retries: $retries")

        try {
            logger.info("Handling job with id: $id")
            handlePayload(payload)
            logger.info("Finished handling job")
        } catch (ex: Exception) {
            logger.error("Error thrown from job ${this.javaClass.simpleName}: ${ex.message}")

            retries++
            dataMap.put("retries", retries)

            if (retries < maxRetries.toInt()) {
                val e2 = JobExecutionException(ex)
                try {
                    Thread.sleep(30000)
                } catch (_: InterruptedException) {
                }

                e2.setRefireImmediately(true)
                throw e2
            } else {
                logger.error("Max retries reached")
                throw ex
            }
        }
    }

    /**
     * Method to get the payload type for deserialization.
     */
    protected abstract fun getPayloadType(): Class<TPayload>

    /**
     * Method to handle the payload after deserialization.
     */
    abstract fun handlePayload(payload: TPayload)
}
