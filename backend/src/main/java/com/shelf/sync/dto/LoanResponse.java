package com.shelf.sync.dto;

import com.shelf.sync.entity.Loan;
import com.shelf.sync.entity.LoanStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class LoanResponse {

    private Long id;
    private UserResponse member;
    private BookResponse book;
    private UserResponse issuedBy;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private LoanStatus status;
    private String notes;
    private long overdueDays;
    private BigDecimal calculatedFine;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LoanResponse() {
    }

    public LoanResponse(Loan loan) {
        if (loan != null) {
            this.id = loan.getId();
            this.member = loan.getMember() != null ? new UserResponse(loan.getMember()) : null;
            this.book = loan.getBook() != null ? new BookResponse(loan.getBook()) : null;
            this.issuedBy = loan.getIssuedBy() != null ? new UserResponse(loan.getIssuedBy()) : null;
            this.issueDate = loan.getIssueDate();
            this.dueDate = loan.getDueDate();
            this.returnDate = loan.getReturnDate();
            this.status = loan.getStatus();
            this.notes = loan.getNotes();
            this.createdAt = loan.getCreatedAt();
            this.updatedAt = loan.getUpdatedAt();

            // Calculate overdue days
            LocalDate compareDate = (loan.getReturnDate() != null) ? loan.getReturnDate() : LocalDate.now();
            if (compareDate.isAfter(loan.getDueDate())) {
                this.overdueDays = ChronoUnit.DAYS.between(loan.getDueDate(), compareDate);
            } else {
                this.overdueDays = 0;
            }
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserResponse getMember() {
        return member;
    }

    public void setMember(UserResponse member) {
        this.member = member;
    }

    public BookResponse getBook() {
        return book;
    }

    public void setBook(BookResponse book) {
        this.book = book;
    }

    public UserResponse getIssuedBy() {
        return issuedBy;
    }

    public void setIssuedBy(UserResponse issuedBy) {
        this.issuedBy = issuedBy;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public LoanStatus getStatus() {
        return status;
    }

    public void setStatus(LoanStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public long getOverdueDays() {
        return overdueDays;
    }

    public void setOverdueDays(long overdueDays) {
        this.overdueDays = overdueDays;
    }

    public BigDecimal getCalculatedFine() {
        return calculatedFine;
    }

    public void setCalculatedFine(BigDecimal calculatedFine) {
        this.calculatedFine = calculatedFine;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
