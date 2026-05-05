-- ============================================
-- Portfolio Database Setup Script (MySQL)
-- Run this in MySQL before starting the app
-- ============================================

-- Create the database
CREATE DATABASE IF NOT EXISTS portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

-- Users table (auto-created by Hibernate, but here for reference)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Insert sample data (optional - for testing)
-- ============================================

-- NOTE: Hibernate with spring.jpa.hibernate.ddl-auto=update
-- will create these tables automatically.
-- This file is for manual reference only.

-- Sample admin user (password: admin123)
-- Password hash generated with BCrypt
-- INSERT INTO users (username, email, password_hash) VALUES
-- ('admin', 'admin@portfolio.com', '$2a$10$...(bcrypt hash here)...');

SELECT 'Database setup complete!' AS message;
