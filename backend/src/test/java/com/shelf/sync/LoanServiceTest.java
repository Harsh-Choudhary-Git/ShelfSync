package com.shelf.sync;

import com.shelf.sync.dto.IssueLoanRequest;
import com.shelf.sync.dto.LoanResponse;
import com.shelf.sync.dto.ReturnLoanRequest;
import com.shelf.sync.entity.*;
import com.shelf.sync.exception.BadRequestException;
import com.shelf.sync.repository.*;
import com.shelf.sync.service.AuthService;
import com.shelf.sync.service.LoanService;
import com.shelf.sync.service.SettingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FineRepository fineRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private SettingService settingService;

    @Mock
    private AuthService authService;

    @InjectMocks
    private LoanService loanService;

    private User member;
    private User librarian;
    private Book book;

    @BeforeEach
    void setUp() {
        member = new User("member1", "mem@example.com", "pass", "Member", "One", "123", Role.ROLE_MEMBER);
        member.setId(1L);
        member.setStatus(UserStatus.ACTIVE);

        librarian = new User("lib1", "lib@example.com", "pass", "Lib", "One", "123", Role.ROLE_LIBRARIAN);
        librarian.setId(2L);

        book = new Book("978-0132350884", "Clean Code", "Handbook", null, null, null, 2008, 5, 2, "Shelf A-1", null);
        book.setId(10L);
    }

    @Test
    void testIssueBook_Success() {
        IssueLoanRequest request = new IssueLoanRequest(1L, 10L, null, "Issue test");

        when(userRepository.findById(1L)).thenReturn(Optional.of(member));
        when(loanRepository.countByMemberIdAndStatus(1L, LoanStatus.ACTIVE)).thenReturn(1L);
        when(settingService.getMaxActiveLoansPerMember()).thenReturn(5);
        when(fineRepository.findByMemberIdAndStatus(1L, FineStatus.UNPAID)).thenReturn(Collections.emptyList());
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(settingService.getBorrowDurationDays()).thenReturn(14);
        when(authService.getCurrentUserEntity()).thenReturn(librarian);

        Loan mockSavedLoan = new Loan(member, book, librarian, LocalDate.now(), LocalDate.now().plusDays(14));
        mockSavedLoan.setId(100L);
        when(loanRepository.save(any(Loan.class))).thenReturn(mockSavedLoan);

        LoanResponse response = loanService.issueBook(request);

        assertNotNull(response);
        assertEquals(LoanStatus.ACTIVE, response.getStatus());
        assertEquals(1, book.getAvailableCopies()); // Decremented from 2 to 1
        verify(bookRepository, times(1)).save(book);
        verify(loanRepository, times(1)).save(any(Loan.class));
    }

    @Test
    void testIssueBook_UnavailableCopies_ThrowsBadRequest() {
        book.setAvailableCopies(0);
        IssueLoanRequest request = new IssueLoanRequest(1L, 10L, 14, "Issue test");

        when(userRepository.findById(1L)).thenReturn(Optional.of(member));
        when(loanRepository.countByMemberIdAndStatus(1L, LoanStatus.ACTIVE)).thenReturn(0L);
        when(settingService.getMaxActiveLoansPerMember()).thenReturn(5);
        when(fineRepository.findByMemberIdAndStatus(1L, FineStatus.UNPAID)).thenReturn(Collections.emptyList());
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));

        assertThrows(BadRequestException.class, () -> loanService.issueBook(request));
        verify(loanRepository, never()).save(any(Loan.class));
    }

    @Test
    void testReturnBook_OnTime_Success() {
        Loan loan = new Loan(member, book, librarian, LocalDate.now().minusDays(5), LocalDate.now().plusDays(9));
        loan.setId(100L);
        loan.setStatus(LoanStatus.ACTIVE);

        when(loanRepository.findById(100L)).thenReturn(Optional.of(loan));
        when(loanRepository.save(any(Loan.class))).thenAnswer(i -> i.getArguments()[0]);

        ReturnLoanRequest returnRequest = new ReturnLoanRequest(LocalDate.now(), "Returned in good condition");
        LoanResponse response = loanService.returnBook(100L, returnRequest);

        assertNotNull(response);
        assertEquals(LoanStatus.RETURNED, response.getStatus());
        assertEquals(3, book.getAvailableCopies()); // Incremented from 2 to 3
        verify(fineRepository, never()).save(any(Fine.class));
    }

    @Test
    void testReturnBook_Overdue_CalculatesFine() {
        // Loan due 4 days ago, returned today
        Loan loan = new Loan(member, book, librarian, LocalDate.now().minusDays(18), LocalDate.now().minusDays(4));
        loan.setId(101L);
        loan.setStatus(LoanStatus.ACTIVE);

        when(loanRepository.findById(101L)).thenReturn(Optional.of(loan));
        when(settingService.getFinePerDay()).thenReturn(BigDecimal.valueOf(1.50));
        when(loanRepository.save(any(Loan.class))).thenAnswer(i -> i.getArguments()[0]);

        ReturnLoanRequest returnRequest = new ReturnLoanRequest(LocalDate.now(), "Returned late");
        LoanResponse response = loanService.returnBook(101L, returnRequest);

        assertNotNull(response);
        assertEquals(LoanStatus.RETURNED, response.getStatus());
        assertEquals(4, response.getOverdueDays());
        assertEquals(BigDecimal.valueOf(6.00), response.getCalculatedFine());
        verify(fineRepository, times(1)).save(any(Fine.class));
    }

    @Test
    void testReturnBook_AlreadyReturned_ThrowsBadRequest() {
        Loan loan = new Loan(member, book, librarian, LocalDate.now().minusDays(10), LocalDate.now().minusDays(2));
        loan.setId(102L);
        loan.setStatus(LoanStatus.RETURNED);

        when(loanRepository.findById(102L)).thenReturn(Optional.of(loan));

        assertThrows(BadRequestException.class, () -> loanService.returnBook(102L, new ReturnLoanRequest()));
    }
}
