import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './auth/ProtectedRoute'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import SubmitProof from './pages/SubmitProof'
import SubmissionDetail from './pages/SubmissionDetail'
import CharacterProfile from './pages/CharacterProfile'
import Leaderboard from './pages/Leaderboard'
import Groups from './pages/Groups'
import Updates from './pages/Updates'
import Submissions from './pages/Submissions'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route
          path="/tasks/:id/submit"
          element={
            <ProtectedRoute>
              <SubmitProof />
            </ProtectedRoute>
          }
        />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/submissions/:id" element={<SubmissionDetail />} />
        <Route path="/characters/:id" element={<CharacterProfile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/groups" element={<Groups />} />
        <Route
          path="/updates"
          element={
            <ProtectedRoute>
              <Updates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}
