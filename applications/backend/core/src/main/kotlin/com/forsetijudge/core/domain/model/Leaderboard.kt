package com.forsetijudge.core.domain.model

import java.time.OffsetDateTime
import java.util.UUID

/**
 * Represents the leaderboard of a contest, which contains information about the contestants and their performance in the contest.
 *
 * @param contestId The ID of the contest.
 * @param isFrozen Whether the leaderboard is frozen, meaning that it will not be updated with new submissions until the contest ends.
 * @param rows A list of rows corresponding to each contestant in the contest, containing information about their performance.
 * @param issuedAt The time when the leaderboard was generated.
 */
data class Leaderboard(
    val contestId: UUID,
    val contestStartAt: OffsetDateTime,
    val isFrozen: Boolean,
    val rows: List<Row>,
    val issuedAt: OffsetDateTime,
) {
    /**
     * Represents a row in the leaderboard, which corresponds to a contestant and contains information about their performance in the contest.
     *
     * @param memberId The ID of the contestant.
     * @param memberName The name of the contestant.
     * @param score The total score of the contestant, which is typically the number of problems they have solved.
     * @param penalty The total penalty time in minutes for the contestant, which is calculated based on the time of acceptance and the number of wrong submissions for each problem.
     * @param cells A list of cells corresponding to each problem in the contest, containing information about the contestant's performance on each problem.
     */
    data class Row(
        val memberId: UUID,
        val memberName: String,
        val score: Int,
        val penalty: Int,
        val cells: List<Cell>,
    )

    /**
     * Represents a cell in the leaderboard, which corresponds to a problem and contains information about the contestant's performance on that problem.
     *
     * @param problemId The ID of the problem.
     * @param problemLetter The letter assigned to the problem (e.g., 'A', 'B', 'C', etc.).
     * @param problemColor The hexadecimal color representing the status of the problem for the contestant.
     * @param isAccepted Whether the problem was accepted by the contestant.
     * @param acceptedAt The time when the problem was accepted. This is only relevant if `isAccepted` is true.
     * @param wrongSubmissions The number of wrong submissions made for this problem before it was accepted. This is only relevant if `isAccepted` is true.
     * @param penalty The penalty time in minutes for this problem, which is calculated based on the time of acceptance and the number of wrong submissions. This is only relevant if `isAccepted` is true.
     */
    data class Cell(
        val problemId: UUID,
        val problemLetter: Char,
        val problemColor: String,
        val isAccepted: Boolean,
        val acceptedAt: OffsetDateTime?,
        val wrongSubmissions: Int,
        val penalty: Int,
    )
}
