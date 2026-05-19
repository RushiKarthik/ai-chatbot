import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/error.css';

const NotFound = () => {
  return (
    <div className="error-page">
      <Navbar />
      <div className="error-container">
        <h1>404</h1>
        <p>Page not found</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  );
};

export default NotFound;
