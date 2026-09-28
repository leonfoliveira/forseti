package com.forsetijudge.core.infrastructure.secretsmanager

import com.forsetijudge.core.port.output.vault.Vault
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest

@Component
class SecretsManagerVault(
    private val secretsManagerClient: SecretsManagerClient,
) : Vault {
    override fun getSecret(key: String): String? {
        val request =
            GetSecretValueRequest
                .builder()
                .secretId(key)
                .build()

        val secret = secretsManagerClient.getSecretValue(request).secretString()

        return secret
    }
}
