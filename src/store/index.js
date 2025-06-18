import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import adminReducer from '../features/auth/adminSlice';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isInitialized'], // persist these fields
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const adminPersistConfig = {
  key: 'admin',
  storage,
  whitelist: ['admin', 'isInitialized'], // persist these fields
};

const persistedAdminReducer = persistReducer(adminPersistConfig, adminReducer);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    admin: persistedAdminReducer, // use persisted admin reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;
