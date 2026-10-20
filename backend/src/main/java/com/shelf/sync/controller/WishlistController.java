package com.shelf.sync.controller;

import com.shelf.sync.dto.ApiResponse;
import com.shelf.sync.dto.WishlistResponse;
import com.shelf.sync.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/my-wishlist")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getMyWishlist() {
        return ResponseEntity.ok(wishlistService.getMyWishlist());
    }

    @PostMapping("/{bookId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(@PathVariable Long bookId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(bookId));
    }

    @DeleteMapping("/{bookId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(@PathVariable Long bookId) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(bookId));
    }
}
