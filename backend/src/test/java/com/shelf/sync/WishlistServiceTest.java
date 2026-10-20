package com.shelf.sync;

import com.shelf.sync.dto.WishlistResponse;
import com.shelf.sync.entity.Book;
import com.shelf.sync.entity.User;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.repository.BookRepository;
import com.shelf.sync.entity.WishlistItem;
import com.shelf.sync.repository.WishlistRepository;
import com.shelf.sync.service.AuthService;
import com.shelf.sync.service.WishlistService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.test.util.ReflectionTestUtils;
import org.junit.jupiter.api.Test;


import org.mockito.Mock;


import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


public class WishlistServiceTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private AuthService authService;

    private WishlistService wishlistService;

    private User member;
    private Book book;

    @BeforeEach
    void setUp() {
        member = new User("member1", "mem@example.com", "pass", "Member", "One", "123", com.shelf.sync.entity.Role.ROLE_MEMBER);
        member.setId(1L);
        member.setStatus(com.shelf.sync.entity.UserStatus.ACTIVE);
        book = new com.shelf.sync.entity.Book("978-0201896831", "TAOCP", "Algorithms", null, null, null, 1997, 2, 0, "Shelf A-1", null);
        book.setId(5L);
        // Initialize mocks manually
        wishlistRepository = mock(WishlistRepository.class);
        bookRepository = mock(BookRepository.class);
        authService = new AuthService() {
            @Override
            public User getCurrentUserEntity() {
                return member;
            }
        };
        wishlistService = new WishlistService();
        ReflectionTestUtils.setField(wishlistService, "wishlistRepository", wishlistRepository);
        ReflectionTestUtils.setField(wishlistService, "bookRepository", bookRepository);
        ReflectionTestUtils.setField(wishlistService, "authService", authService);
    }

    @Test
    void testAddToWishlist_Success() {
        when(bookRepository.findById(5L)).thenReturn(Optional.of(book));
        when(wishlistRepository.existsByUserIdAndBookId(1L, 5L)).thenReturn(false);
        when(wishlistRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var response = wishlistService.addToWishlist(5L);
        assertNotNull(response);
        WishlistResponse payload = response.getData();
        assertEquals(5L, payload.getBookId());
        verify(wishlistRepository, times(1)).save(any());
    }

    @Test
    void testAddToWishlist_AlreadyExists_ThrowsConflict() {
        when(bookRepository.findById(5L)).thenReturn(Optional.of(book));
        when(wishlistRepository.existsByUserIdAndBookId(1L, 5L)).thenReturn(true);
        assertThrows(ConflictException.class, () -> wishlistService.addToWishlist(5L));
        verify(wishlistRepository, never()).save(any());
    }

    @Test
    void testAddToWishlist_BookNotFound_ThrowsNotFound() {
        when(bookRepository.findById(5L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> wishlistService.addToWishlist(5L));
    }

    @Test
    void testRemoveFromWishlist_Success() {
        WishlistItem item = new WishlistItem(member, book);
        item.setId(10L);
        when(wishlistRepository.findByUserIdAndBookId(1L, 5L)).thenReturn(Optional.of(item));
        var response = wishlistService.removeFromWishlist(5L);
        assertNotNull(response);
        verify(wishlistRepository, times(1)).delete(item);
    }
}
