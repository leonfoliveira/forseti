package com.forsetijudge.core.port.output.vault

interface Vault {
    /**
     * Retrieves a secret value from the vault based on the provided key.
     *
     * @param key The key associated with the secret to be retrieved.
     * @return The secret value corresponding to the provided key.
     */
    fun getSecret(key: String): String?
}
