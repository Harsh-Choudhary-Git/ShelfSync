package com.shelf.sync.dto;

import jakarta.validation.constraints.NotNull;

public class ReservationRequest {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    private Long memberId; // Optional: used by Librarian/Admin to reserve on behalf of member

    public ReservationRequest() {
    }

    public ReservationRequest(Long bookId) {
        this.bookId = bookId;
    }

    public ReservationRequest(Long bookId, Long memberId) {
        this.bookId = bookId;
        this.memberId = memberId;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }
}
