package com.shelf.sync.service;

import com.shelf.sync.dto.FineResponse;
import com.shelf.sync.dto.PayFineRequest;
import com.shelf.sync.entity.Fine;
import com.shelf.sync.entity.FineStatus;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.exception.BadRequestException;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.exception.UnauthorizedException;
import com.shelf.sync.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public Page<FineResponse> searchFines(Long memberId, FineStatus status, String search, Pageable pageable) {
        return fineRepository.searchFines(memberId, status, search, pageable)
                .map(FineResponse::new);
    }

    @Transactional(readOnly = true)
    public FineResponse getFineById(Long id) {
        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found with id: " + id));
        return new FineResponse(fine);
    }

    @Transactional
    public FineResponse payFine(Long id, PayFineRequest request) {
        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found with id: " + id));

        User currentUser = authService.getCurrentUserEntity();
        if (currentUser.getRole() == Role.ROLE_MEMBER && !fine.getMember().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only pay your own fines");
        }

        if (fine.getStatus() == FineStatus.PAID) {
            throw new BadRequestException("This fine has already been paid");
        }

        fine.setStatus(FineStatus.PAID);
        fine.setPaidAt(LocalDateTime.now());

        Fine updated = fineRepository.save(fine);
        return new FineResponse(updated);
    }

    @Transactional(readOnly = true)
    public BigDecimal getMemberUnpaidFinesTotal(Long memberId) {
        return fineRepository.sumAmountByMemberIdAndStatus(memberId, FineStatus.UNPAID);
    }
}
