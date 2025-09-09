import { validateGitHubUrl, parseGitHubUrl, validateRepositorySubmission } from '../validation';

describe('validateGitHubUrl', () => {
  it('should validate correct GitHub URLs', () => {
    expect(validateGitHubUrl('https://github.com/owner/repo')).toBe(true);
    expect(validateGitHubUrl('https://github.com/owner/repo/')).toBe(true);
    expect(validateGitHubUrl('https://github.com/test-user/test-repo')).toBe(true);
    expect(validateGitHubUrl('https://github.com/user.name/repo.name')).toBe(true);
  });

  it('should reject invalid GitHub URLs', () => {
    expect(validateGitHubUrl('')).toBe(false);
    expect(validateGitHubUrl('not-a-url')).toBe(false);
    expect(validateGitHubUrl('https://gitlab.com/owner/repo')).toBe(false);
    expect(validateGitHubUrl('https://github.com/owner')).toBe(false);
    expect(validateGitHubUrl('https://github.com/owner/repo/issues')).toBe(false);
    expect(validateGitHubUrl('http://github.com/owner/repo')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(validateGitHubUrl('   ')).toBe(false);
    expect(validateGitHubUrl('https://github.com//repo')).toBe(false);
    expect(validateGitHubUrl('https://github.com/owner/')).toBe(false);
  });
});

describe('parseGitHubUrl', () => {
  it('should parse valid GitHub URLs', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo')).toEqual({
      owner: 'owner',
      repo: 'repo'
    });
    expect(parseGitHubUrl('https://github.com/test-user/test-repo/')).toEqual({
      owner: 'test-user',
      repo: 'test-repo'
    });
  });

  it('should return null for invalid URLs', () => {
    expect(parseGitHubUrl('invalid-url')).toBeNull();
    expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
    expect(parseGitHubUrl('')).toBeNull();
  });
});

describe('validateRepositorySubmission', () => {
  it('should validate correct submissions', () => {
    const result = validateRepositorySubmission('https://github.com/owner/repo');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty submissions', () => {
    const result = validateRepositorySubmission('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a GitHub repository URL');
  });

  it('should reject invalid URLs', () => {
    const result = validateRepositorySubmission('invalid-url');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
  });
});