import './app.css';
import { Outlet, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import FormLayout from './components/FormLayout';

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';

export default function App() {
  return (
    <>
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
    </>
  );
}