package com.shelf.sync.service;

import com.shelf.sync.dto.DashboardStatsResponse;
import com.shelf.sync.dto.LoanResponse;
import com.shelf.sync.dto.ReservationResponse;
import com.shelf.sync.dto.UserResponse;
import com.shelf.sync.entity.FineStatus;
import com.shelf.sync.entity.LoanStatus;
import com.shelf.sync.entity.ReservationStatus;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getAdminStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalAdmins(userRepository.countByRole(Role.ROLE_ADMIN));
        stats.setTotalLibrarians(userRepository.countByRole(Role.ROLE_LIBRARIAN));
        stats.setTotalMembers(userRepository.countByRole(Role.ROLE_MEMBER));

        stats.setTotalBooks(bookRepository.count());
        stats.setTotalCopies(bookRepository.sumTotalCopies());
        stats.setAvailableCopies(bookRepository.sumAvailableCopies());
        stats.setBorrowedCopies(stats.getTotalCopies() - stats.getAvailableCopies());

        stats.setTotalLoans(loanRepository.count());
        stats.setActiveLoans(loanRepository.countByStatus(LoanStatus.ACTIVE));
        stats.setOverdueLoans(loanRepository.countByStatus(LoanStatus.OVERDUE));
        stats.setReturnedLoans(loanRepository.countByStatus(LoanStatus.RETURNED));

        stats.setActiveReservations(reservationRepository.countByStatus(ReservationStatus.ACTIVE));

        BigDecimal unpaidFines = fineRepository.sumAmountByStatus(FineStatus.UNPAID);
        BigDecimal paidFines = fineRepository.sumAmountByStatus(FineStatus.PAID);
        stats.setUnpaidFinesAmount(unpaidFines);
        stats.setPaidFinesAmount(paidFines);
        stats.setTotalFinesAmount(unpaidFines.add(paidFines));

        // Recent loans
        List<LoanResponse> recentLoans = loanRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream().map(LoanResponse::new).collect(Collectors.toList());
        stats.setRecentLoans(recentLoans);

        // Recent members
        List<UserResponse> recentMembers = userRepository.findByRole(Role.ROLE_MEMBER, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream().map(UserResponse::new).collect(Collectors.toList());
        stats.setRecentMembers(recentMembers);

        return stats;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getLibrarianStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setTotalBooks(bookRepository.count());
        stats.setTotalCopies(bookRepository.sumTotalCopies());
        stats.setAvailableCopies(bookRepository.sumAvailableCopies());
        stats.setBorrowedCopies(stats.getTotalCopies() - stats.getAvailableCopies());
        stats.setTotalMembers(userRepository.countByRole(Role.ROLE_MEMBER));

        stats.setActiveLoans(loanRepository.countByStatus(LoanStatus.ACTIVE));
        stats.setOverdueLoans(loanRepository.countByStatus(LoanStatus.OVERDUE));
        stats.setReturnedLoans(loanRepository.countByStatus(LoanStatus.RETURNED));
        stats.setActiveReservations(reservationRepository.countByStatus(ReservationStatus.ACTIVE));

        BigDecimal unpaidFines = fineRepository.sumAmountByStatus(FineStatus.UNPAID);
        stats.setUnpaidFinesAmount(unpaidFines);

        // Recent loans
        List<LoanResponse> recentLoans = loanRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream().map(LoanResponse::new).collect(Collectors.toList());
        stats.setRecentLoans(recentLoans);

        // Recent reservations
        List<ReservationResponse> recentReservations = reservationRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "reservationDate")))
                .stream().map(ReservationResponse::new).collect(Collectors.toList());
        stats.setRecentReservations(recentReservations);

        return stats;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getMemberStats() {
        User member = authService.getCurrentUserEntity();
        DashboardStatsResponse stats = new DashboardStatsResponse();

        long activeLoans = loanRepository.countByMemberIdAndStatus(member.getId(), LoanStatus.ACTIVE);
        long overdueLoans = loanRepository.countByMemberIdAndStatus(member.getId(), LoanStatus.OVERDUE);
        long returnedLoans = loanRepository.countByMemberIdAndStatus(member.getId(), LoanStatus.RETURNED);
        long activeReservations = reservationRepository.countByMemberIdAndStatus(member.getId(), ReservationStatus.ACTIVE);
        BigDecimal unpaidFine = fineRepository.sumAmountByMemberIdAndStatus(member.getId(), FineStatus.UNPAID);

        stats.setMemberActiveLoans(activeLoans + overdueLoans);
        stats.setMemberReturnedLoans(returnedLoans);
        stats.setMemberActiveReservations(activeReservations);
        stats.setMemberOutstandingFine(unpaidFine);

        // Member's recent loans
        List<LoanResponse> recentLoans = loanRepository.searchLoans(member.getId(), null, null, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "issueDate")))
                .stream().map(LoanResponse::new).collect(Collectors.toList());
        stats.setRecentLoans(recentLoans);

        return stats;
    }
}
