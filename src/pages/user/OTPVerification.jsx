import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, resendOtp, verifyPasswordResetOtp, resendPasswordResetOtp } from '../../features/auth/authSlice';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/use-toast';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '../../components/ui/input-otp';

const OTPVerification = () => {
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(120);
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get email from either location state or search params
  const email = state?.email || searchParams.get('email');
  
  // Check if this is for password reset
  const isPasswordReset = searchParams.get('type') === 'reset-password' || state?.type === 'reset-password';

  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      toast({
        title: "Error",
        description: "No email provided. Please try again.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Start resend timer countdown
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email, navigate]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Incomplete OTP",
        description: "Please enter all 6 digits of your OTP",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      if (isPasswordReset) {
        // Verify OTP for password reset
        const result = await dispatch(verifyPasswordResetOtp({ email, otp })).unwrap();
        
        toast({
          title: "OTP Verified",
          description: "You can now reset your password",
        });
        
        // Navigate to reset password page with reset token
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        });
      } else {
        // Verify OTP for email verification
        await dispatch(verifyOtp({ email, otp })).unwrap();
        
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified",
        });
        
        // Navigate to dashboard or auth page
        setTimeout(() => {
          navigate('/auth');
        });
      }
    } catch (err) {
      toast({
        title: "Verification Failed",
        description: err?.message || 'Invalid OTP. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      if (isPasswordReset) {
        // Resend OTP for password reset
        await dispatch(resendPasswordResetOtp({ email })).unwrap();
      } else {
        // Resend OTP for email verification
        await dispatch(resendOtp({ email })).unwrap();
      }

      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email",
      });

      // Reset timer to 60 seconds for password reset, 120 for email verification
      const newTimer = isPasswordReset ? 60 : 120;
      setResendTimer(newTimer);

      // Restart timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast({
        title: "Resend Failed",
        description: err?.message || "Could not resend OTP",
        variant: "destructive",
      });
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#13071D] p-4">
      <div className="w-full max-w-md">
        <div className="glass-morphism bg-[#1A0E29]/60 p-8 rounded-xl border border-white/10 shadow-xl animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isPasswordReset ? 'Verify Password Reset' : 'Verify Your Email'}
            </h1>
            <p className="text-gray-300">
              {isPasswordReset 
                ? 'Enter the 6-digit code sent to your email to reset your password.'
                : 'Enter the 6-digit code sent to your email to continue.'
              }
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Code sent to: {email}
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex justify-center">
              <InputOTP 
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-12 h-14 text-xl font-bold text-white bg-black/20 border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleVerifyOtp}
                className="bg-gradient-to-r from-neon-purple to-neon-blue text-white w-full py-6 hover:from-neon-blue hover:to-neon-purple hover:glow-purple transition-all"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className={`text-sm ${
                    resendTimer > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-neon-purple hover:text-neon-blue hover:underline'
                  }`}
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : 'Resend OTP'}
                </button>
              </div>

              {/* Back to login button for password reset */}
              {isPasswordReset && (
                <div className="text-center">
                  <button
                    onClick={handleBackToLogin}
                    className="text-sm text-gray-400 hover:text-white hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 opacity-30">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;