import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RoleRoute from './components/RoleRoute';
import MyOpportunities from './pages/MyOpportunities';
import BrowseOpportunities from './pages/BrowseOpportunities';
import CreateOpportunity from './pages/CreateOpportunity';
import EditOpportunity from './pages/EditOpportunity';
import OpportunityDetail from './pages/OpportunityDetail';
import Applicants from './pages/Applicants';
import MyApplications from './pages/MyApplications';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<RoleRoute roles={['organiser', 'volunteer']}><Profile /></RoleRoute>} />
        <Route path="/organiser/opportunities" element={<RoleRoute roles={['organiser']}><MyOpportunities /></RoleRoute>} />
        <Route path="/opportunities" element={<RoleRoute roles={['volunteer']}><BrowseOpportunities /></RoleRoute>} />
        <Route path="/organiser/opportunities/new" element={<RoleRoute roles={['organiser']}><CreateOpportunity /></RoleRoute>} />
        <Route path="/organiser/opportunities/:id/edit" element={<RoleRoute roles={['organiser']}><EditOpportunity /></RoleRoute>} />
        <Route path="/opportunities/:id" element={<RoleRoute roles={['volunteer']}><OpportunityDetail /></RoleRoute>} />
        <Route path="/organiser/opportunities/:id/applicants" element={<RoleRoute roles={['organiser']}><Applicants /></RoleRoute>} />
        <Route path="/my-applications" element={<RoleRoute roles={['volunteer']}><MyApplications /></RoleRoute>} />
      </Routes>
    </Router>
  );
}

export default App;