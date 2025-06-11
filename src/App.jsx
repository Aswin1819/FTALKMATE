import './index.css'
import { BrowserRouter as Router, Routes } from 'react-router-dom'
import { Provider } from 'react-redux';
import store from './store/index';
import { Toaster } from './components/ui/toaster';
import AuthProvider from './components/routes/AuthProvider'
import userRoutes from './routes/userRoutes';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* User Routes */}
            {userRoutes}
            {/* Admin Routes */}
            {/* <AdminRoutes /> */}
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </Provider>
  );
};

export default App;