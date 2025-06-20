import React,{useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/auth/authSlice';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../hooks/use-toast';
import ForgotPasswordModal from './ForgotPasswordModal';
import GoogleAuth from '../../api/GoogleAuth';


const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const LoginForm = ({ onToggle }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

const onSubmit = (values) => {
  dispatch(loginUser(values)).unwrap()  
    .then(()=>{
      toast({
        title:"Login Successfull",
        description : "Welcome to TalkMate.",
        variant :"success",
      });
      navigate('/dashboard');
    })
    .catch((err) => {
      toast({
        title:"Login Failed",
        description: err?.detail || "Something went wrong!. Please try again.",
        variant : "destructive"
      })
      console.error(err); 
    });
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400">Log in to your account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="your@email.com"
                    type="email"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-xs text-neon-purple hover:text-neon-blue transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="••••••••"
                    type="password"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90 text-white glow-purple"
          >
            Login
          </Button>
        </form>
      </Form>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <Button
          variant="outline"
          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all hover:glow-blue"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            {/* <path
              d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
              fill="currentColor"
            /> */}
          </svg>
          <GoogleAuth />
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onToggle}
            className="text-neon-purple hover:text-neon-blue transition-colors font-medium"
          >
            Register
          </button>
        </p>
      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)} 
      />
      </div>
    </motion.div>
    
  );
};

export default LoginForm;
