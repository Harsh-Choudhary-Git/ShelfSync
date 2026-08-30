package com.shelf.sync;

import com.shelf.sync.dto.ReservationRequest;
import com.shelf.sync.dto.ReservationResponse;
import com.shelf.sync.entity.*;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.repository.BookRepository;
import com.shelf.sync.repository.LoanRepository;
import com.shelf.sync.repository.ReservationRepository;
import com.shelf.sync.service.AuthService;
import com.shelf.sync.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private ReservationService reservationService;

    private User member;
    private Book book;

    @BeforeEach
    void setUp() {
        member = new User("member1", "mem@example.com", "pass", "Member", "One", "123", Role.ROLE_MEMBER);
        member.setId(1L);
        member.setStatus(UserStatus.ACTIVE);

        book = new Book("978-0201896831", "TAOCP", "Algorithms", null, null, null, 1997, 2, 0, "Shelf A-16", null);
        book.setId(5L);
    }

    @Test
    void testCreateReservation_Success() {
        ReservationRequest request = new ReservationRequest(5L);

        when(authService.getCurrentUserEntity()).thenReturn(member);
        when(bookRepository.findById(5L)).thenReturn(Optional.of(book));
        when(reservationRepository.existsByMemberIdAndBookIdAndStatus(1L, 5L, ReservationStatus.ACTIVE)).thenReturn(false);
        when(loanRepository.findByMemberIdAndStatus(1L, LoanStatus.ACTIVE)).thenReturn(Collections.emptyList());

        Reservation savedReservation = new Reservation(member, book, LocalDateTime.now(), LocalDateTime.now().plusDays(7));
        savedReservation.setId(20L);
        savedReservation.setStatus(ReservationStatus.ACTIVE);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(savedReservation);
        when(reservationRepository.findByBookIdAndStatusOrderByReservationDateAsc(5L, ReservationStatus.ACTIVE))
                .thenReturn(List.of(savedReservation));

        ReservationResponse response = reservationService.createReservation(request);

        assertNotNull(response);
        assertEquals(ReservationStatus.ACTIVE, response.getStatus());
        assertEquals(1, response.getQueuePosition());
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    void testCreateReservation_DuplicateActiveReservation_ThrowsConflict() {
        ReservationRequest request = new ReservationRequest(5L);

        when(authService.getCurrentUserEntity()).thenReturn(member);
        when(bookRepository.findById(5L)).thenReturn(Optional.of(book));
        when(reservationRepository.existsByMemberIdAndBookIdAndStatus(1L, 5L, ReservationStatus.ACTIVE)).thenReturn(true);

        assertThrows(ConflictException.class, () -> reservationService.createReservation(request));
        verify(reservationRepository, never()).save(any(Reservation.class));
    }
}
