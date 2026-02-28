package com.forsetijudge.core.port.driven.broadcast

interface BroadcastProducer {
    fun produce(event: BroadcastEvent)
}
