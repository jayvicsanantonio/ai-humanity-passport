# Requirements Document

## Introduction

The Humanity Passport is a Next.js web application that evaluates GitHub repositories and issues them a "Humanity Passport" badge indicating whether the project contributes positively to humanity. The system allows developers to submit their repositories for analysis, receive an AI-generated assessment, and embed a dynamic badge in their README that links to a detailed analysis page. The goal is to encourage socially responsible software development and make positive impact visible and gamified.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to submit my GitHub repository for humanity assessment, so that I can receive a badge indicating my project's positive impact.

#### Acceptance Criteria

1. WHEN a user enters a valid GitHub repository URL THEN the system SHALL parse the owner/repo pattern and validate the format
2. WHEN a valid repository URL is submitted THEN the system SHALL fetch repository metadata from the GitHub API including description, stars, topics, and README content
3. WHEN repository metadata is successfully fetched THEN the system SHALL queue the repository for LLM analysis
4. IF a repository URL is invalid or malformed THEN the system SHALL display an appropriate error message
5. WHEN a repository has already been analyzed THEN the system SHALL update the existing analysis rather than create a duplicate

### Requirement 2

**User Story:** As a system administrator, I want the application to analyze repositories using AI, so that consistent and objective assessments can be provided.

#### Acceptance Criteria

1. WHEN a repository is queued for analysis THEN the system SHALL send repository metadata to the Groq LLM using the gpt-oss-20b model
2. WHEN the LLM receives repository data THEN it SHALL return a structured response containing a verdict ("approved" or "rejected") and detailed analysis
3. WHEN the LLM analysis is complete THEN the system SHALL store the verdict and details in the database
4. IF the LLM analysis fails THEN the system SHALL retry up to 3 times before marking the analysis as failed
5. WHEN storing analysis results THEN the system SHALL ensure data persistence using SQLite via Prisma ORM

### Requirement 3

**User Story:** As a developer, I want to receive a dynamic SVG badge for my repository, so that I can display my humanity passport status in my README.

#### Acceptance Criteria

1. WHEN a repository has been analyzed THEN the system SHALL generate a dynamic SVG badge reflecting the verdict
2. WHEN the verdict is "approved" THEN the badge SHALL display green with "Humanity+ Passport" text
3. WHEN the verdict is "rejected" THEN the badge SHALL display red with "Not Approved" text
4. WHEN the badge is clicked THEN it SHALL redirect to the repository's passport page
5. WHEN a badge is requested for an unanalyzed repository THEN the system SHALL return a "pending analysis" badge

### Requirement 4

**User Story:** As a visitor, I want to view detailed analysis of a repository, so that I can understand why it received its humanity passport verdict.

#### Acceptance Criteria

1. WHEN a user visits /passport/[owner]/[repo] THEN the system SHALL display the repository's complete analysis
2. WHEN displaying the passport page THEN the system SHALL show the repository name, badge, verdict, and detailed reasoning
3. WHEN on the passport page THEN the system SHALL provide a copy-paste Markdown snippet for embedding the badge
4. IF a passport page is requested for an unanalyzed repository THEN the system SHALL display a "not yet analyzed" message
5. WHEN the passport page loads THEN it SHALL be publicly accessible without authentication

### Requirement 5

**User Story:** As a system administrator, I want to ensure data persistence and prevent abuse, so that the application remains reliable and secure.

#### Acceptance Criteria

1. WHEN storing analysis data THEN the system SHALL use a unique constraint on owner/repo combination to prevent duplicates
2. WHEN a user submits multiple requests for the same repository THEN the system SHALL rate-limit submissions to prevent abuse
3. WHEN displaying LLM-generated content THEN the system SHALL sanitize output to prevent XSS attacks
4. WHEN validating repository URLs THEN the system SHALL ensure they match the expected GitHub URL pattern
5. WHEN the database is queried THEN the system SHALL handle connection errors gracefully and provide appropriate user feedback

### Requirement 6

**User Story:** As a developer, I want a clean and intuitive user interface, so that I can easily submit repositories and understand the results.

#### Acceptance Criteria

1. WHEN a user visits the home page THEN they SHALL see a clear input field for GitHub repository URLs
2. WHEN a user submits a repository THEN they SHALL receive immediate feedback about the submission status
3. WHEN analysis is complete THEN the user SHALL see a confirmation page with the badge and passport link
4. WHEN viewing any page THEN the interface SHALL be responsive and work on mobile devices
5. WHEN interacting with the application THEN loading states SHALL be clearly indicated to the user