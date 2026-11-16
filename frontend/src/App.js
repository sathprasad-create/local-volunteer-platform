import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import RoleRoute from './components/RoleRoute';
import MyOpportunities from './pages/MyOpportunities';
import BrowseOpportunities from './pages/BrowseOpportunities';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<RoleRoute roles={['organiser', 'volunteer']}><Profile /></RoleRoute>} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/organiser/opportunities" element={<RoleRoute roles={['organiser']}><MyOpportunities /></RoleRoute>} />
        <Route path="/opportunities" element={<RoleRoute roles={['volunteer']}><BrowseOpportunities /></RoleRoute>} />
      </Routes>
    </Router>
  );
}

export default App;