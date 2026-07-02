import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useStore';
import Login from '@/pages/Login/Login';
import Dashboard from '@/pages/Dashboard/Dashboard';
import GradeList from '@/pages/Grades/GradeList';
import GradeRegister from '@/pages/Grades/GradeRegister';
import GradeEdit from '@/pages/Grades/GradeEdit';
import GradeReview from '@/pages/Grades/GradeReview';
import ScheduleView from '@/pages/Schedule/ScheduleView';
import ScheduleArrange from '@/pages/Schedule/ScheduleArrange';
import AppealList from '@/pages/Appeals/AppealList';
import ExamSchedule from '@/pages/Exam/ExamSchedule';
import UserManagement from '@/pages/UserManagement/UserManagement';
import Profile from '@/pages/Profile/Profile';

const ProtectedRoute = ({ children, requireRole }: { children: React.ReactNode; requireRole?: string[] }) => {
  const { isLoggedIn, user } = useAuthStore();
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  if (requireRole && user && !requireRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/grades" 
          element={
            <ProtectedRoute>
              <GradeList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/grades/register" 
          element={
            <ProtectedRoute requireRole={['admin', 'teacher']}>
              <GradeRegister />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/grades/edit/:id" 
          element={
            <ProtectedRoute requireRole={['admin']}>
              <GradeEdit />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/grades/review" 
          element={
            <ProtectedRoute requireRole={['admin', 'homeroom_teacher']}>
              <GradeReview />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/schedule" 
          element={
            <ProtectedRoute>
              <ScheduleView />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/schedule/arrange" 
          element={
            <ProtectedRoute requireRole={['admin']}>
              <ScheduleArrange />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/appeals" 
          element={
            <ProtectedRoute>
              <AppealList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/exam" 
          element={
            <ProtectedRoute requireRole={['admin']}>
              <ExamSchedule />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requireRole={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;