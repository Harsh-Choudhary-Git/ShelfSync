package com.shelf.sync.dto;

import com.shelf.sync.entity.Reservation;
import com.shelf.sync.entity.ReservationStatus;

import java.time.LocalDateTime;

public class ReservationResponse {

    private Long id;
    private UserResponse member;
    private BookResponse book;
    private LocalDateTime reservationDate;
    private LocalDateTime expiryDate;
    private ReservationStatus status;
    private Integer queuePosition;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReservationResponse() {
    }

    public ReservationResponse(Reservation reservation) {
        if (reservation != null) {
            this.id = reservation.getId();
            this.member = reservation.getMember() != null ? new UserResponse(reservation.getMember()) : null;
            this.book = reservation.getBook() != null ? new BookResponse(reservation.getBook()) : null;
            this.reservationDate = reservation.getReservationDate();
            this.expiryDate = reservation.getExpiryDate();
            this.status = reservation.getStatus();
            this.createdAt = reservation.getCreatedAt();
            this.updatedAt = reservation.getUpdatedAt();
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

    public LocalDateTime getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDateTime reservationDate) {
        this.reservationDate = reservationDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public Integer getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(Integer queuePosition) {
        this.queuePosition = queuePosition;
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
