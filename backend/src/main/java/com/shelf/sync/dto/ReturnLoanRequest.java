package com.shelf.sync.dto;

import java.time.LocalDate;

public class ReturnLoanRequest {

    private LocalDate returnDate; // Optional: defaults to LocalDate.now()

    private String notes;

    public ReturnLoanRequest() {
    }

    public ReturnLoanRequest(LocalDate returnDate, String notes) {
        this.returnDate = returnDate;
        this.notes = notes;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
