import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { resetPassword } from '../../features/auth/authSlice';
import { useSearchParams } from 'react-router-dom';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

  const passwordChecks = [
    { label: 'At least 6 characters', valid: password.length >= 6 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Contains number', valid: /\d/.test(password) },
    { label: 'Contains special character', valid: /[!@#$%^&*]/.test(password) },
  ];

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      // You need to get the email (from location state, search params, or redux)
      console.log(email)
      if (!email) {
        toast({
          title: 'Missing Email',
          description: 'Email is required to reset password.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      await dispatch(resetPassword({ email, password: values.password })).unwrap();
      toast({
        title: 'Password Changed Successfully',
        description: 'Your password has been updated. Please log in with your new password.',
      });
      setTimeout(() => {
        navigate('/auth');
      }, 1000);
    } catch (err) {
      toast({
        title: 'Password Reset Failed',
        description: err?.message || 'Could not reset password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#13071D] p-4">
      <div className="w-full max-w-md">
        <div className="glass-morphism bg-[#1A0E29]/60 p-8 rounded-xl border border-white/10 shadow-xl animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-gray-300">Create a new password for your account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="••••••••"
                          type={showPassword ? 'text' : 'password'}
                          className="bg-white/5 border-white/10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {password && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Password strength:</p>
                  <div className="space-y-1">
                    {passwordChecks.map((check, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {check.valid ? (
                          <Check size={12} className="text-green-400" />
                        ) : (
                          <X size={12} className="text-red-400" />
                        )}
                        <span className={check.valid ? 'text-green-400' : 'text-gray-400'}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="••••••••"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="bg-white/5 border-white/10 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90 text-white glow-purple py-6"
                disabled={isLoading}
              >
                {isLoading ? 'Updating Password...' : 'Reset Password'}
              </Button>
            </form>
          </Form>

          <div className="mt-10 opacity-30">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
