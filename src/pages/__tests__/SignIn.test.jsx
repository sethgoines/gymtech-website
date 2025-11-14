import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// mocks for useAuth
const mockSignIn = vi.fn(() => Promise.resolve())
const mockSignUp = vi.fn(() => Promise.resolve())
const mockSignOut = vi.fn()

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ signIn: mockSignIn, signUp: mockSignUp, signOut: mockSignOut, user: null, loading: false })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

import SignIn from '../SignIn'

describe('SignIn page', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
    mockSignUp.mockClear()
    mockSignOut.mockClear()
  })

  test('shows validation error for empty fields', async () => {
    render(<SignIn />)
    const signInBtn = screen.getByRole('button', { name: /sign in/i })
    await userEvent.click(signInBtn)
    await waitFor(async () => {
      expect(await screen.findByRole('alert')).toHaveTextContent(/email is required/i)
    })
  })

  test('shows validation error for invalid email', async () => {
    render(<SignIn />)
    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    await userEvent.type(email, 'bad-email')
    await userEvent.type(password, 'abcdef')
    const signInBtn = screen.getByRole('button', { name: /sign in/i })
    await userEvent.click(signInBtn)
    await waitFor(async () => {
      expect(await screen.findByRole('alert')).toHaveTextContent(/please enter a valid email address/i)
    })
  })

  test('calls signUp when create account is clicked with valid input', async () => {
    render(<SignIn />)
    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    await userEvent.type(email, 'test@example.com')
    await userEvent.type(password, 'password123')
    const createBtn = screen.getByRole('button', { name: /create account/i })
  await userEvent.click(createBtn)
  await waitFor(() => expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123'))
  })
})
