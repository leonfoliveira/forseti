package io.github.leonfoliveira.forseti.api.application.port.driven

import io.github.leonfoliveira.forseti.common.application.service.dto.output.LeaderboardOutputDTO

interface LeaderboardEmitter {
    /**
     * Emits a leaderboard to the appropriate channels.
     *
     * @param leaderboard The leaderboard to be emitted.
     */
    fun emit(leaderboard: LeaderboardOutputDTO)
}
