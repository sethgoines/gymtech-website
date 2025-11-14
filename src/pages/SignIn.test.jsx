import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import SignIn from './SignIn'
import { vi } from 'vitest'

// Mock useNavigate from react-router-dom so component's navigate calls don't throw
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// Mock the AuthContext so we can assert signIn/signUp calls
const mockSignIn = vi.fn(() => Promise.resolve())
const mockSignUp = vi.fn(() => Promise.resolve())
const mockSignOut = vi.fn()
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
    user: null,
    loading: false
  })
}))

describe('SignIn page', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
    mockSignUp.mockClear()
  })

  test('shows validation errors when fields are empty', async () => {
    render(<SignIn />)
    const user = userEvent.setup()
    const submit = screen.getByRole('button', { name: /sign in/i })
    await user.click(submit)
    expect(await screen.findByRole('alert')).toHaveTextContent(/Email is required|Please enter a valid email address/i)
  })

  test('calls signIn with email and password', async () => {
    render(<SignIn />)
    const user = userEvent.setup()
    const emailInput = screen.getByLabelText(/email/i)
    const passInput = screen.getByLabelText(/password/i)
    await user.type(emailInput, 'test@example.com')
    await user.type(passInput, 'password123')
    const submit = screen.getByRole('button', { name: /sign in/i })
    await user.click(submit)
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  test('calls signUp when create account clicked', async () => {
    render(<SignIn />)
    const user = userEvent.setup()
    const emailInput = screen.getByLabelText(/email/i)
    const passInput = screen.getByLabelText(/password/i)
    await user.type(emailInput, 'newuser@example.com')
    await user.type(passInput, 'newpassword')
    const createBtn = screen.getByRole('button', { name: /create account/i })
    await user.click(createBtn)
    expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'newpassword')
  })
})
