package com.shelf.sync.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsResponse {

    // Global / Admin & Librarian counts
    private long totalUsers;
    private long totalAdmins;
    private long totalLibrarians;
    private long totalMembers;

    private long totalBooks;
    private long totalCopies;
    private long availableCopies;
    private long borrowedCopies;

    private long totalLoans;
    private long activeLoans;
    private long overdueLoans;
    private long returnedLoans;

    private long activeReservations;

    private BigDecimal totalFinesAmount;
    private BigDecimal unpaidFinesAmount;
    private BigDecimal paidFinesAmount;

    // Member specific stats
    private long memberActiveLoans;
    private long memberReturnedLoans;
    private long memberActiveReservations;
    private BigDecimal memberOutstandingFine;

    // Activity feeds & summaries
    private List<LoanResponse> recentLoans;
    private List<ReservationResponse> recentReservations;
    private List<UserResponse> recentMembers;

    public DashboardStatsResponse() {
    }

    // Getters and Setters

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getTotalLibrarians() {
        return totalLibrarians;
    }

    public void setTotalLibrarians(long totalLibrarians) {
        this.totalLibrarians = totalLibrarians;
    }

    public long getTotalMembers() {
        return totalMembers;
    }

    public void setTotalMembers(long totalMembers) {
        this.totalMembers = totalMembers;
    }

    public long getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(long totalBooks) {
        this.totalBooks = totalBooks;
    }

    public long getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(long totalCopies) {
        this.totalCopies = totalCopies;
    }

    public long getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(long availableCopies) {
        this.availableCopies = availableCopies;
    }

    public long getBorrowedCopies() {
        return borrowedCopies;
    }

    public void setBorrowedCopies(long borrowedCopies) {
        this.borrowedCopies = borrowedCopies;
    }

    public long getTotalLoans() {
        return totalLoans;
    }

    public void setTotalLoans(long totalLoans) {
        this.totalLoans = totalLoans;
    }

    public long getActiveLoans() {
        return activeLoans;
    }

    public void setActiveLoans(long activeLoans) {
        this.activeLoans = activeLoans;
    }

    public long getOverdueLoans() {
        return overdueLoans;
    }

    public void setOverdueLoans(long overdueLoans) {
        this.overdueLoans = overdueLoans;
    }

    public long getReturnedLoans() {
        return returnedLoans;
    }

    public void setReturnedLoans(long returnedLoans) {
        this.returnedLoans = returnedLoans;
    }

    public long getActiveReservations() {
        return activeReservations;
    }

    public void setActiveReservations(long activeReservations) {
        this.activeReservations = activeReservations;
    }

    public BigDecimal getTotalFinesAmount() {
        return totalFinesAmount;
    }

    public void setTotalFinesAmount(BigDecimal totalFinesAmount) {
        this.totalFinesAmount = totalFinesAmount;
    }

    public BigDecimal getUnpaidFinesAmount() {
        return unpaidFinesAmount;
    }

    public void setUnpaidFinesAmount(BigDecimal unpaidFinesAmount) {
        this.unpaidFinesAmount = unpaidFinesAmount;
    }

    public BigDecimal getPaidFinesAmount() {
        return paidFinesAmount;
    }

    public void setPaidFinesAmount(BigDecimal paidFinesAmount) {
        this.paidFinesAmount = paidFinesAmount;
    }

    public long getMemberActiveLoans() {
        return memberActiveLoans;
    }

    public void setMemberActiveLoans(long memberActiveLoans) {
        this.memberActiveLoans = memberActiveLoans;
    }

    public long getMemberReturnedLoans() {
        return memberReturnedLoans;
    }

    public void setMemberReturnedLoans(long memberReturnedLoans) {
        this.memberReturnedLoans = memberReturnedLoans;
    }

    public long getMemberActiveReservations() {
        return memberActiveReservations;
    }

    public void setMemberActiveReservations(long memberActiveReservations) {
        this.memberActiveReservations = memberActiveReservations;
    }

    public BigDecimal getMemberOutstandingFine() {
        return memberOutstandingFine;
    }

    public void setMemberOutstandingFine(BigDecimal memberOutstandingFine) {
        this.memberOutstandingFine = memberOutstandingFine;
    }

    public List<LoanResponse> getRecentLoans() {
        return recentLoans;
    }

    public void setRecentLoans(List<LoanResponse> recentLoans) {
        this.recentLoans = recentLoans;
    }

    public List<ReservationResponse> getRecentReservations() {
        return recentReservations;
    }

    public void setRecentReservations(List<ReservationResponse> recentReservations) {
        this.recentReservations = recentReservations;
    }

    public List<UserResponse> getRecentMembers() {
        return recentMembers;
    }

    public void setRecentMembers(List<UserResponse> recentMembers) {
        this.recentMembers = recentMembers;
    }
}
