import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import userService from '../services/login_service';
import verifyService from "../services/verify _service";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await userService.login({ email, password });

      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Redirecting to home...',
        timer: 200,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      navigate('/artist');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid email or password';
      setError(errorMessage);

      await Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    const { value: forgotPasswordEmail } = await Swal.fire({
      title: 'Reset Password',
      text: 'Enter your email address to receive a verification code',
      input: 'email',
      inputPlaceholder: 'Enter your email',
      showCancelButton: true,
      confirmButtonText: 'Send OTP',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancel',
      inputValidator: (value: string) => {
        if (!value) {
          return 'Please enter your email address';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      },
    });

    if (forgotPasswordEmail) {
      try {
        setLoading(true);

        // ✅ Show spinner while sending OTP
        Swal.fire({
          title: 'Sending OTP...',
          html: '<div class="flex justify-center"><div class="loader"></div></div>',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
          customClass: {
            popup: 'rounded-xl shadow-lg',
            title: 'text-lg font-semibold',
          },
        });

        await verifyService.resendOtp({ email: forgotPasswordEmail });

        Swal.close();

        Swal.fire({
          icon: 'success',
          title: 'OTP Sent!',
          text: 'A verification code has been sent to your email.',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        // ✅ Immediately show OTP entry popup
        const { value: verificationCode } = await Swal.fire({
          title: 'Enter Verification Code',
          text: 'Please enter the 6-digit code sent to your email',
          input: 'text',
          inputPlaceholder: 'Enter 6-digit code',
          inputAttributes: {
            maxLength: '6',
            pattern: '[0-9]{6}',
          },
          showCancelButton: true,
          confirmButtonText: 'Verify',
          confirmButtonColor: '#dc2626',
          cancelButtonText: 'Cancel',
          preConfirm: (value: string) => {
            if (!value) {
              Swal.showValidationMessage('Please enter the verification code');
              return false;
            }
            if (!/^\d{6}$/.test(value)) {
              Swal.showValidationMessage('Please enter a valid 6-digit code');
              return false;
            }
            return value;
          },
        });

        if (verificationCode) {
          try {
            await verifyService.verifyEmail({
              email: forgotPasswordEmail,
              otp: verificationCode,
            });

            await Swal.fire({
              icon: 'success',
              title: 'Verification Successful!',
              text: 'You can now reset your password.',
              confirmButtonText: 'Continue',
              confirmButtonColor: '#dc2626',
            });

            // ✅ Prompt for new password
            const { value: newPassword } = await Swal.fire({
              title: 'Reset Your Password',
              input: 'password',
              inputPlaceholder: 'Enter new password',
              inputAttributes: {
                minLength: '6',
              },
              showCancelButton: true,
              confirmButtonText: 'Reset Password',
              confirmButtonColor: '#dc2626',
              cancelButtonText: 'Cancel',
              preConfirm: (value: string) => {
                if (!value) {
                  Swal.showValidationMessage('Please enter a new password');
                  return false;
                }
                if (value.length < 6) {
                  Swal.showValidationMessage('Password must be at least 6 characters long');
                  return false;
                }
                return value;
              },
            });

            if (newPassword) {
              await Swal.fire({
                icon: 'success',
                title: 'Password Reset Successful!',
                text: 'You can now login with your new password.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc2626',
              });
            }
          } catch (error: any) {
            await Swal.fire({
              icon: 'error',
              title: 'Verification Failed',
              text: error.response?.data?.message || error.message || 'Invalid verification code',
              confirmButtonColor: '#dc2626',
            });
          }
        }
      } catch (error: any) {
        Swal.close();
        await Swal.fire({
          icon: 'error',
          title: 'Failed to Send OTP',
          text:
            error.response?.data?.message ||
            error.message ||
            'Unable to send verification code. Please try again.',
          confirmButtonColor: '#dc2626',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>

      {/* Login card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-red-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-red-500" size={20} />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors bg-gray-50"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-red-500" size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors bg-gray-50"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-full ${
              loading
                ? 'bg-red-400'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
            } text-white py-3 rounded-xl font-semibold transform transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && (
              <ArrowRight
                size={20}
                className={`transform transition-transform ${isHovered ? 'translate-x-1' : ''}`}
              />
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/create" className="text-red-600 hover:text-red-700 font-semibold">
            Sign up now
          </a>
        </p>
      </div>
    </div>
  );
}
