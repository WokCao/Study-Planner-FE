import './app.css';
import { Outlet, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import FormLayout from './components/FormLayout';

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/login" element={
          <FormLayout>
            <Login />
          </FormLayout>
        } />
        <Route path="/register" element={
          <FormLayout>
            <Register />
          </FormLayout>
        } />
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />
      </Routes>
      <Outlet />
    </QueryClientProvider>
  );
}