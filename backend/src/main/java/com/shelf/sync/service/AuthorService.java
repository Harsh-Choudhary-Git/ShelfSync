package com.shelf.sync.service;

import com.shelf.sync.dto.AuthorDTO;
import com.shelf.sync.entity.Author;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthorService {

    @Autowired
    private AuthorRepository authorRepository;

    @Transactional(readOnly = true)
    public Page<AuthorDTO> getAllAuthors(String search, Pageable pageable) {
        return authorRepository.searchAuthors(search, pageable)
                .map(AuthorDTO::new);
    }

    @Transactional(readOnly = true)
    public List<AuthorDTO> getAllAuthorsList() {
        return authorRepository.findAll().stream()
                .map(AuthorDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuthorDTO getAuthorById(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + id));
        return new AuthorDTO(author);
    }

    @Transactional
    public AuthorDTO createAuthor(AuthorDTO dto) {
        Author author = new Author(
                dto.getName().trim(),
                dto.getBiography(),
                dto.getNationality(),
                dto.getBirthYear()
        );
        Author saved = authorRepository.save(author);
        return new AuthorDTO(saved);
    }

    @Transactional
    public AuthorDTO updateAuthor(Long id, AuthorDTO dto) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + id));

        author.setName(dto.getName().trim());
        author.setBiography(dto.getBiography());
        author.setNationality(dto.getNationality());
        author.setBirthYear(dto.getBirthYear());

        Author updated = authorRepository.save(author);
        return new AuthorDTO(updated);
    }

    @Transactional
    public void deleteAuthor(Long id) {
        if (!authorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Author not found with id: " + id);
        }
        authorRepository.deleteById(id);
    }
}
