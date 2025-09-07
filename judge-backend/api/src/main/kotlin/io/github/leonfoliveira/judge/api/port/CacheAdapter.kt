package io.github.leonfoliveira.judge.api.port

import java.io.Serializable

interface CacheAdapter<TValue : Serializable> {
    fun get(key: String): TValue?

    fun put(
        key: String,
        value: TValue,
    )
}
