package com.shelf.sync.service;

import com.shelf.sync.dto.IssueLoanRequest;
import com.shelf.sync.dto.LoanResponse;
import com.shelf.sync.dto.ReturnLoanRequest;
import com.shelf.sync.entity.*;
import com.shelf.sync.exception.BadRequestException;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private SettingService settingService;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public Page<LoanResponse> searchLoans(Long memberId, LoanStatus status, String search, Pageable pageable) {
        return loanRepository.searchLoans(memberId, status, search, pageable)
                .map(LoanResponse::new);
    }

    @Transactional(readOnly = true)
    public LoanResponse getLoanById(Long id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + id));
        return new LoanResponse(loan);
    }

    @Transactional
    public LoanResponse issueBook(IssueLoanRequest request) {
        User member = userRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + request.getMemberId()));

        if (member.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Member account is inactive. Cannot issue books.");
        }

        // Check max active loans limit
        long activeLoansCount = loanRepository.countByMemberIdAndStatus(member.getId(), LoanStatus.ACTIVE);
        int maxAllowed = settingService.getMaxActiveLoansPerMember();
        if (activeLoansCount >= maxAllowed) {
            throw new BadRequestException("Member has reached maximum allowed active loans (" + maxAllowed + ")");
        }

        // Check if member has outstanding unpaid fines
        List<Fine> unpaidFines = fineRepository.findByMemberIdAndStatus(member.getId(), FineStatus.UNPAID);
        if (!unpaidFines.isEmpty()) {
            BigDecimal totalUnpaid = unpaidFines.stream()
                    .map(Fine::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (totalUnpaid.compareTo(BigDecimal.valueOf(20.00)) > 0) {
                throw new BadRequestException("Member has unpaid fines totaling $" + totalUnpaid + ". Please clear fines before issuing new books.");
            }
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("Book is currently unavailable for issuing. Available copies: 0");
        }

        // Issue dates
        LocalDate issueDate = LocalDate.now();
        int durationDays = request.getDurationDays() != null && request.getDurationDays() > 0
                ? request.getDurationDays()
                : settingService.getBorrowDurationDays();

        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : issueDate.plusDays(durationDays);
        if (dueDate.isBefore(issueDate)) {
            throw new BadRequestException("Due date cannot be before issue date");
        }

        User currentStaff = authService.getCurrentUserEntity();

        Loan loan = new Loan();
        loan.setMember(member);
        loan.setBook(book);
        loan.setIssuedBy(currentStaff);
        loan.setIssueDate(issueDate);
        loan.setDueDate(dueDate);
        loan.setStatus(LoanStatus.ACTIVE);
        loan.setNotes(request.getNotes());

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Loan savedLoan = loanRepository.save(loan);

        // If member had an active reservation for this book, fulfill it
        reservationRepository.findByMemberIdAndBookIdAndStatus(member.getId(), book.getId(), ReservationStatus.ACTIVE)
                .ifPresent(res -> {
                    res.setStatus(ReservationStatus.FULFILLED);
                    reservationRepository.save(res);
                });

        return new LoanResponse(savedLoan);
    }

    @Transactional
    public LoanResponse returnBook(Long loanId, ReturnLoanRequest request) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (loan.getStatus() == LoanStatus.RETURNED) {
            throw new BadRequestException("This book loan has already been returned");
        }

        LocalDate returnDate = (request != null && request.getReturnDate() != null)
                ? request.getReturnDate()
                : LocalDate.now();

        if (returnDate.isBefore(loan.getIssueDate())) {
            throw new BadRequestException("Return date cannot be before issue date (" + loan.getIssueDate() + ")");
        }

        loan.setReturnDate(returnDate);
        loan.setStatus(LoanStatus.RETURNED);
        if (request != null && request.getNotes() != null) {
            loan.setNotes(request.getNotes());
        }

        // Increment book available copies
        Book book = loan.getBook();
        if (book.getAvailableCopies() < book.getTotalCopies()) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
        }

        Loan savedLoan = loanRepository.save(loan);
        LoanResponse response = new LoanResponse(savedLoan);

        // Check if returned overdue and calculate fine
        if (returnDate.isAfter(loan.getDueDate())) {
            long overdueDays = ChronoUnit.DAYS.between(loan.getDueDate(), returnDate);
            BigDecimal finePerDay = settingService.getFinePerDay();
            BigDecimal fineAmount = finePerDay.multiply(BigDecimal.valueOf(overdueDays));

            Fine fine = new Fine();
            fine.setMember(loan.getMember());
            fine.setLoan(savedLoan);
            fine.setAmount(fineAmount);
            fine.setReason("Overdue return by " + overdueDays + " day(s) for book '" + book.getTitle() + "'");
            fine.setStatus(FineStatus.UNPAID);
            fineRepository.save(fine);

            response.setCalculatedFine(fineAmount);
            response.setOverdueDays(overdueDays);
        }

        return response;
    }

    @Transactional
    public void syncOverdueLoans() {
        LocalDate today = LocalDate.now();
        List<Loan> overdueLoans = loanRepository.findOverdueActiveLoans(today);
        for (Loan loan : overdueLoans) {
            loan.setStatus(LoanStatus.OVERDUE);
            loanRepository.save(loan);
        }
    }
}
