package live.forseti.core.port.driving.usecase.session

interface DeleteSessionUsecase {
    /**
     * Deletes the current user's session, effectively logging them out.
     */
    fun deleteCurrent()
}
