package com.shelf.sync.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class IssueLoanRequest {

    @NotNull(message = "Member ID is required")
    private Long memberId;

    @NotNull(message = "Book ID is required")
    private Long bookId;

    private Integer durationDays; // Optional: overrides default if provided

    private LocalDate dueDate; // Optional: custom due date

    private String notes;

    public IssueLoanRequest() {
    }

    public IssueLoanRequest(Long memberId, Long bookId, Integer durationDays, String notes) {
        this.memberId = memberId;
        this.bookId = bookId;
        this.durationDays = durationDays;
        this.notes = notes;
    }

    // Getters and Setters

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
