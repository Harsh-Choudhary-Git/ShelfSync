package com.shelf.sync;

import com.shelf.sync.dto.FineResponse;
import com.shelf.sync.dto.PayFineRequest;
import com.shelf.sync.entity.Fine;
import com.shelf.sync.entity.FineStatus;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.exception.BadRequestException;
import com.shelf.sync.repository.FineRepository;
import com.shelf.sync.service.AuthService;
import com.shelf.sync.service.FineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FineServiceTest {

    @Mock
    private FineRepository fineRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private FineService fineService;

    private User member;
    private Fine fine;

    @BeforeEach
    void setUp() {
        member = new User("member1", "mem@example.com", "pass", "Member", "One", "123", Role.ROLE_MEMBER);
        member.setId(1L);

        fine = new Fine(member, null, BigDecimal.valueOf(4.50), "Overdue return");
        fine.setId(50L);
        fine.setStatus(FineStatus.UNPAID);
    }

    @Test
    void testPayFine_Success() {
        when(fineRepository.findById(50L)).thenReturn(Optional.of(fine));
        when(authService.getCurrentUserEntity()).thenReturn(member);
        when(fineRepository.save(any(Fine.class))).thenAnswer(i -> i.getArguments()[0]);

        PayFineRequest request = new PayFineRequest(BigDecimal.valueOf(4.50), "CREDIT_CARD");
        FineResponse response = fineService.payFine(50L, request);

        assertNotNull(response);
        assertEquals(FineStatus.PAID, response.getStatus());
        assertNotNull(response.getPaidAt());
        verify(fineRepository, times(1)).save(fine);
    }

    @Test
    void testPayFine_AlreadyPaid_ThrowsBadRequest() {
        fine.setStatus(FineStatus.PAID);
        when(fineRepository.findById(50L)).thenReturn(Optional.of(fine));
        when(authService.getCurrentUserEntity()).thenReturn(member);

        assertThrows(BadRequestException.class, () -> fineService.payFine(50L, new PayFineRequest()));
        verify(fineRepository, never()).save(fine);
    }
}
