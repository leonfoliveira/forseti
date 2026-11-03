package com.forsetijudge.core.infrastructure.secretsmanager

import com.forsetijudge.core.testcontainer.TestContainerFloci
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.testcontainers.junit.jupiter.Testcontainers

@Testcontainers
class SecretsManagerVaultIntegrationTest : TestContainerFloci() {
    private val vault = SecretsManagerVault(secretsManagerClient)

    @Test
    fun `reads a secret stored in secrets manager`() {
        secretsManagerClient.createSecret { it.name("test/secret").secretString("s3cr3t") }

        assertEquals("s3cr3t", vault.getSecret("test/secret"))
    }
}
