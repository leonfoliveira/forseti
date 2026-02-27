package com.forsetijudge.core.port.driven.cache

import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import java.time.OffsetDateTime

interface BroadcastEventCacheStore {
    /**
     * Add a broadcast event to the cache store.
     *
     * @param event The broadcast event to be added to the cache store.
     */
    fun cache(event: BroadcastEvent)

    /**
     * Get all broadcast events for a specific room that have been added to the cache store since a given timestamp.
     *
     * @param room The room for which to retrieve broadcast events.
     * @param timestamp The timestamp since which to retrieve broadcast events.
     * @return A list of broadcast events for the specified room that have been added to the
     */
    fun getAllSince(
        room: String,
        timestamp: OffsetDateTime,
    ): List<BroadcastEvent>
}
