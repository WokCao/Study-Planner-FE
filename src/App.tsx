import "./App.css";
import { Outlet, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import FormLayout from "./components/FormLayout";

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './components/ForgotPassword';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Analytics from "./components/analytics/Analytics";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
        </Route>
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
        <Route path="/forgot" element={
          <FormLayout>
            <ForgotPassword />
          </FormLayout>
        } />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
        </Route>
        <Route
          path="/analytics"
          element={
            <FormLayout>
              <Analytics />
            </FormLayout>
          }
        />
      </Routes>
      <Outlet />
    </QueryClientProvider>
  );
}
