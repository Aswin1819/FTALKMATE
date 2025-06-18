import './index.css'
import { BrowserRouter as Router, Routes } from 'react-router-dom'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store/index';
import { Toaster } from './components/ui/toaster';
import AuthProvider from './components/routes/AuthProvider'
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AuthProvider>
            <Routes>
              {/* User Routes */}
              {userRoutes}
              {/* Admin Routes */}
              {adminRoutes}
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;