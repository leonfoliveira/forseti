package com.forsetijudge.core.service.session

import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase

class FindSessionByIdService : FindSessionByIdUseCase {
    /**
     * @return the session found by the given id
     */
    override fun execute(command: FindSessionByIdUseCase.Command): SessionResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
