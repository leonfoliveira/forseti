# Rules

## Member Types

The platform supports different member types, each with specific permissions:

- **ROOT**: A unique member created during installation with the highest level of access to all contests.
- **ADMIN**: Members with administrative privileges who can manage a single contest with the highest level of access.
- **STAFF**: Members with support privileges who can handle and update tickets within a single contest.
- **JUDGE**: Members who can manually judge submissions and answer clarifications within a single contest.
- **CONTESTANT**: Members who can submit solutions and request clarifications within a single contest.
- **UNOFFICIAL_CONTESTANT**: Members with the same permissions as contestants but with lower priority in the auto judge queue and are hidden from final standings.
- **GUEST**: Members who can access contests without signing in, with read-only access.

## Contest Management

### Creation and Deletion
- Only ROOT members can create and delete contests
- Contests cannot be deleted once they have started
- Each contest must have a unique slug identifier

### Access Control
- Only ROOT members can list all contests
- ROOT and ADMIN members can update contest details and manage problems and members
- ROOT members can access any contest, while other members can only access contests they participate in
- GUEST, CONTESTANT, and UNOFFICIAL_CONTESTANT members cannot access contests before they begin

### Contest Settings

ROOT and ADMIN members can enable or disable the following contest features:

- **Auto judge**: Automatically evaluates and scores submissions when enabled
- **Clarifications**: Allows contestants to ask questions about problems when enabled
- **Submission print tickets**: Enables contestants to request printing of their submission code
- **Technical support tickets**: Allows contestants to request technical assistance
- **Non-technical support tickets**: Enables contestants to request general support
- **Guest access**: Permits anonymous access to the contest when enabled

## Leaderboard

### Ranking System

Contestants are ranked according to the following tiebreaker rules, in order of priority:

1. **Score**: Number of problems solved (descending order)
2. **Penalty time**: Total minutes from contest start to first accepted submission for each solved problem, plus 20 minutes for each rejected submission before the first acceptance of that problem (ascending order)
3. **Submission time**: Minutes from contest start to the first accepted submission, then second accepted submission, and so forth
4. **Team name**: Alphabetical order

### Leaderboard Control

- Once frozen, the leaderboard will not update with new submissions until unfrozen
- Only ROOT and ADMIN members can freeze or unfreeze the leaderboard
- ROOT and ADMIN members can use the reveal feature to view the complete leaderboard even when it is frozen

## Problem Access

- **Problem descriptions**: Available to all members
- **Test cases**: Available only to ROOT, ADMIN, STAFF, and JUDGE members

## Submissions

### Submission Rights
- Only CONTESTANT and UNOFFICIAL_CONTESTANT members can submit solutions
- UNOFFICIAL_CONTESTANT submissions have lower priority in the auto judge queue

### Code Access
- CONTESTANT and UNOFFICIAL_CONTESTANT members can download their own submission code
- ROOT, ADMIN, STAFF, and JUDGE members can download any submission code

### Additional Features
- CONTESTANT and UNOFFICIAL_CONTESTANT members can request print tickets for their submissions
- ROOT, ADMIN, STAFF, and JUDGE members can review auto judge executions and download outputs
- ROOT, ADMIN, and JUDGE members can:
    - Send submissions back to the auto judge for re-evaluation
    - Manually set submission results

## Clarifications

- **Requesting**: Only CONTESTANT and UNOFFICIAL_CONTESTANT members can ask for clarifications
- **Answering**: Only ROOT, ADMIN, and JUDGE members can respond to clarifications
- **Management**: Only ROOT, ADMIN, and JUDGE members can delete clarifications

## Announcements

- Only ROOT and ADMIN members can create announcements

## Support Tickets

### Ticket Creation
- All signed-in members can create support tickets

### Ticket Access
- CONTESTANT, UNOFFICIAL_CONTESTANT, and JUDGE members can only view their own tickets
- ROOT, ADMIN, and STAFF members can view all tickets

### Ticket Management
- ROOT, ADMIN, and STAFF members can update ticket status
