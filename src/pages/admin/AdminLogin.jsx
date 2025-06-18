import React, { useState,useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { adminLogin,setInitialized} from '../../features/auth/adminSlice'; // <-- import your admin thunk
import { toast } from '../../hooks/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, isInitialized } = useSelector(state => state.admin); // optional: show loading/error UI
  
  useEffect(() => {
    if(!isInitialized){
      dispatch(setInitialized());
    }
  }, [dispatch,isInitialized]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const result = await dispatch(adminLogin({ email, password })).unwrap();
    toast({
      title: "Admin Login Successful",
      description: "Welcome to the admin dashboard.",
      variant: "default", // or "success" if you support it
    });
    navigate('/admin/dashboard');
  } catch (err) {
    toast({
      title: "Admin Login Failed",
      description: err?.message || "Invalid credentials or server error.",
      variant: "destructive",
    });
  }
};

  return (
    <div className="min-h-screen bg-[#13071D] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-neon-purple/10 blur-[100px] animate-pulse-soft"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-neon-blue/10 blur-[100px] animate-pulse-soft"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold">
            <span className="text-neon-purple">Talk</span>
            <span className="text-white">Mate</span>
          </div>
          <p className="text-gray-400 mt-2">Admin Portal</p>
        </div>

        <Card className="w-full backdrop-blur-lg bg-black/30 border border-white/10 shadow-lg">
          <CardHeader className="space-y-1 border-b border-white/5 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-white">Admin Login</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white focus:border-neon-purple focus:ring-neon-purple/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Link
                    to="/admin/forgot-password"
                    className="text-sm text-neon-purple hover:text-neon-purple/80 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white focus:border-neon-purple focus:ring-neon-purple/20"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white transition-all duration-300 mt-2"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-white/5 pt-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-neon-purple transition-colors">
              ← Back to User Site
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
