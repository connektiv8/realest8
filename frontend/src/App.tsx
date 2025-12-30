import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import VendorPortal from './pages/VendorPortal'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">RealEst8</Link>
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/vendor-portal">Vendor Portal</Link>
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vendor-portal" element={<VendorPortal />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <p>&copy; 2024 RealEst8 - Flat $1,000 Commission on Every Sale</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
