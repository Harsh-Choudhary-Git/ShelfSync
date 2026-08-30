package com.shelf.sync.service;

import com.shelf.sync.dto.CategoryDTO;
import com.shelf.sync.entity.Category;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<CategoryDTO> getAllCategories(String search, Pageable pageable) {
        return categoryRepository.searchCategories(search, pageable)
                .map(CategoryDTO::new);
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategoriesList() {
        return categoryRepository.findAll().stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return new CategoryDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("Category with name '" + dto.getName().trim() + "' already exists");
        }

        Category category = new Category(
                dto.getName().trim(),
                dto.getDescription()
        );
        Category saved = categoryRepository.save(category);
        return new CategoryDTO(saved);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getName().equalsIgnoreCase(dto.getName().trim()) &&
                categoryRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("Category with name '" + dto.getName().trim() + "' already exists");
        }

        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription());

        Category updated = categoryRepository.save(category);
        return new CategoryDTO(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
