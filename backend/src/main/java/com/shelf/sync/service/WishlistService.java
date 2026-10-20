package com.shelf.sync.service;

import com.shelf.sync.dto.ApiResponse;
import com.shelf.sync.dto.WishlistResponse;
import com.shelf.sync.entity.Book;
import com.shelf.sync.entity.User;
import com.shelf.sync.entity.WishlistItem;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.repository.BookRepository;
import com.shelf.sync.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public ApiResponse<List<WishlistResponse>> getMyWishlist() {
        User currentUser = authService.getCurrentUserEntity();
        List<WishlistItem> items = wishlistRepository.findAllByUserIdOrderByAddedAtDesc(currentUser.getId());
        List<WishlistResponse> response = items.stream()
                .map(WishlistResponse::new)
                .collect(Collectors.toList());
        return ApiResponse.ok("Wishlist retrieved successfully", response);
    }

    @Transactional
    public ApiResponse<WishlistResponse> addToWishlist(Long bookId) {
        User currentUser = authService.getCurrentUserEntity();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        if (wishlistRepository.existsByUserIdAndBookId(currentUser.getId(), bookId)) {
            throw new ConflictException("Book already in wishlist");
        }
        WishlistItem item = new WishlistItem(currentUser, book);
        WishlistItem saved = wishlistRepository.save(item);
        return ApiResponse.ok("Book added to wishlist", new WishlistResponse(saved));
    }

    @Transactional
    public ApiResponse<Void> removeFromWishlist(Long bookId) {
        User currentUser = authService.getCurrentUserEntity();
        WishlistItem item = wishlistRepository.findByUserIdAndBookId(currentUser.getId(), bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found for book id: " + bookId));
        wishlistRepository.delete(item);
        return ApiResponse.ok("Book removed from wishlist", null);
    }
}
