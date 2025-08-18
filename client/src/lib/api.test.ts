import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api';

// Mock the fetch function
const mockFetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockFetch.mockReset();
    // @ts-ignore - We're replacing the global fetch for testing
    global.fetch = mockFetch;
  });

  afterEach(() => {
    // Restore the original fetch after each test
    // @ts-ignore
    global.fetch = global.originalFetch;
  });

  it('should fetch accounts with correct headers', async () => {
    // Mock the response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: '1', name: 'Test Account' }]),
    });

    // Call the API function
    const accounts = await api.getAccounts('business-123', 'user-123');

    // Check that fetch was called with the correct parameters
    expect(mockFetch).toHaveBeenCalledWith('/api/accounts', {
      headers: {
        'Content-Type': 'application/json',
        'business-id': 'business-123',
        'user-id': 'user-123',
      },
    });

    // Check the result
    expect(accounts).toHaveLength(1);
    expect(accounts[0].name).toBe('Test Account');
  });

  it('should handle API errors', async () => {
    // Mock an error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    // Check that the function throws an error
    await expect(api.getAccounts('business-123', 'user-123')).rejects.toThrow('404 Not Found');
  });

  it('should create an account', async () => {
    // Mock the response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'new-account', name: 'New Account' }),
    });

    // Call the API function
    const newAccount = await api.createAccount({
      name: 'New Account',
      type: 'customer',
      businessId: 'business-123',
      userId: 'user-123',
    });

    // Check that fetch was called with the correct parameters
    expect(mockFetch).toHaveBeenCalledWith('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'business-id': 'business-123',
        'user-id': 'user-123',
      },
      body: JSON.stringify({
        name: 'New Account',
        type: 'customer',
        businessId: 'business-123',
        userId: 'user-123',
      }),
    });

    // Check the result
    expect(newAccount.name).toBe('New Account');
  });
});