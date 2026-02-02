import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTheme } from '../hooks/useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    // Clear localStorage and reset document attribute before each test
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });
  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    // Set initial theme to dark
    localStorage.setItem('theme', 'dark');
    
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
  });

  it('should persist theme to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should set data-theme attribute on document root', async () => {
    const { result } = renderHook(() => useTheme());
    
    await act(async () => {
      result.current.toggleTheme();
    });
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
