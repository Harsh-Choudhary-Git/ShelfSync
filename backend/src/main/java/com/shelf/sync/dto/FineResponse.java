package com.shelf.sync.dto;

import com.shelf.sync.entity.Fine;
import com.shelf.sync.entity.FineStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FineResponse {

    private Long id;
    private UserResponse member;
    private Long loanId;
    private String bookTitle;
    private String bookIsbn;
    private BigDecimal amount;
    private String reason;
    private FineStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public FineResponse() {
    }

    public FineResponse(Fine fine) {
        if (fine != null) {
            this.id = fine.getId();
            this.member = fine.getMember() != null ? new UserResponse(fine.getMember()) : null;
            if (fine.getLoan() != null) {
                this.loanId = fine.getLoan().getId();
                if (fine.getLoan().getBook() != null) {
                    this.bookTitle = fine.getLoan().getBook().getTitle();
                    this.bookIsbn = fine.getLoan().getBook().getIsbn();
                }
            }
            this.amount = fine.getAmount();
            this.reason = fine.getReason();
            this.status = fine.getStatus();
            this.createdAt = fine.getCreatedAt();
            this.paidAt = fine.getPaidAt();
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

    public Long getLoanId() {
        return loanId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBookIsbn() {
        return bookIsbn;
    }

    public void setBookIsbn(String bookIsbn) {
        this.bookIsbn = bookIsbn;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public FineStatus getStatus() {
        return status;
    }

    public void setStatus(FineStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
