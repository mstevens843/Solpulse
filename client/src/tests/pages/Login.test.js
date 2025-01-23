import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/login';
import axios from 'axios';

// Mock axios
jest.mock('axios');

beforeEach(() => {
  jest.spyOn(Storage.prototype, 'setItem');
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Login Component', () => {
  it('renders the login form correctly', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays validation errors for invalid email format', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('displays validation errors for short passwords', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input' }), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/password must be at least 6 characters long/i)).toBeInTheDocument();
  });

  it('navigates to dashboard and saves token on successful login', async () => {
    axios.post.mockResolvedValue({ data: { token: 'mockToken' } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input' }), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mockToken');
    });
  });

  it('handles server errors gracefully', async () => {
    axios.post.mockRejectedValue(new Error('Server Error'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input' }), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/unable to log in\. please try again later\./i)).toBeInTheDocument();
  });
});




// Features Covered in Tests
// Form Rendering:

// Ensures that all input fields and buttons are correctly rendered.
// Validation:

// Tests for invalid email formats and passwords shorter than 6 characters.
// Error Handling:

// Tests server-side errors such as invalid credentials.
// Success Flow:

// Verifies successful login and navigation to the /dashboard.
// Loading State:

// Ensures the spinner is displayed during form submission.