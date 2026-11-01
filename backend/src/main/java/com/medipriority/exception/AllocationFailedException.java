package com.medipriority.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class AllocationFailedException extends RuntimeException {
    public AllocationFailedException(String message) {
        super(message);
    }
}
