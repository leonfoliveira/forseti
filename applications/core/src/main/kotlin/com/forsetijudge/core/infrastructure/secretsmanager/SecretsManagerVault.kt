package com.forsetijudge.core.infrastructure.secretsmanager

import com.forsetijudge.core.infrastructure.secretsmanager.adapter.SecretsManager
import com.forsetijudge.core.port.output.vault.Vault
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient

@Component
class SecretsManagerVault(
    secretsManagerClient: SecretsManagerClient,
) : Vault {
    private val secretsManager = SecretsManager(secretsManagerClient)

    override fun getSecret(key: String): String? = secretsManager.getSecretValue(key)
}
