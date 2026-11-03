package com.forsetijudge.core.infrastructure.secretsmanager

import com.forsetijudge.core.domain.exception.InternalServerException
import com.forsetijudge.core.infrastructure.secretsmanager.adapter.SecretsManager
import com.forsetijudge.core.port.output.vault.Vault
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient

@Component
class SecretsManagerVault(
    secretsManagerClient: SecretsManagerClient,
) : Vault {
    private val logger = SafeLogger(this::class)

    private val secretsManager = SecretsManager(secretsManagerClient)

    override fun getSecret(key: String): String {
        logger.info("Retrieving secret for key: $key")
        val value =
            secretsManager.getSecretValue(key) ?: throw InternalServerException("Secret not found for key: $key")
        return value
    }
}
