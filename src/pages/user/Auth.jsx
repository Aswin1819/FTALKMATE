import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthIllustration from '../../components/auth/authIllustration';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <AuthLayout
      illustration={<AuthIllustration />}
      title="TalkMate"
      subtitle="Practice language with real people"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isLogin ? (
            <LoginForm onToggle={toggleForm} />
          ) : (
            <RegisterForm onToggle={toggleForm} />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
};

export default Auth;
