package live.forseti.core.port.driving.usecase.session

interface DeleteSessionUseCase {
    /**
     * Deletes the current user's session, effectively logging them out.
     */
    fun deleteCurrent()
}
