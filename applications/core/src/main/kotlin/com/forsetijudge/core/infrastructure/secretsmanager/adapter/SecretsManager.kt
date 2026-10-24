package com.forsetijudge.core.infrastructure.secretsmanager.adapter

import com.forsetijudge.core.util.SafeLogger
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest

class SecretsManager(
    private val secretsManagerClient: SecretsManagerClient,
) {
    private val logger = SafeLogger(this::class)

    fun getSecretValue(key: String): String? {
        logger.info("Getting secret value from key $key")

        val request =
            GetSecretValueRequest
                .builder()
                .secretId(key)
                .build()

        val secret = secretsManagerClient.getSecretValue(request).secretString()

        return secret
    }
}
