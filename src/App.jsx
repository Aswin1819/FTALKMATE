import './index.css'
import {BrowserRouter as Router,Routes,Route,Navigate} from 'react-router-dom'
import Index from './pages/user/Index';
import Auth from './pages/user/Auth';
import React, { useState } from "react";
const App = ()=>{

  return(
    <Router>
      <Routes>
        <Route path='/' element={<Index/>} />
        <Route path="/auth" element={<Auth/>}/>

      </Routes>
    </Router>
  )
  
}

export default App;