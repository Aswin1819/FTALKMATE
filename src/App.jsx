import './index.css'
import {BrowserRouter as Router,Routes,Route,Navigate} from 'react-router-dom'
import Index from './pages/user/Index';
import Auth from './pages/user/Auth';
import OTPVerification from './pages/user/OTPVerification';
import Dashboard from './pages/user/dashboard/Dashboard';
import DashboardHome from './pages/user/dashboard/DashboardHome';
import UserProfile from './pages/user/dashboard/UserProfile';
import React, { useState } from "react";
const App = ()=>{

  return(
    <Router>
      <Routes>
        <Route path='/' element={<Index/>} />
        <Route path="/auth" element={<Auth/>}/>
        <Route path="/otp-verification" element={<OTPVerification/>}/>

        <Route path="/dashboard" element={<Dashboard/>}>
          <Route index element={<DashboardHome/>} />
          <Route path="profile" element={<UserProfile/>} />
        </Route>

      </Routes>
    </Router>
  )
  
}

export default App;