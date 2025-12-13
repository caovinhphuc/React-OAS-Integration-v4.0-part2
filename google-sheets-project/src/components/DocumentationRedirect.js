import { useEffect } from 'react';

const DocumentationRedirect = ({ path }) => {
  useEffect(() => {
    // Redirect to GitHub documentation
    const githubUrl = `https://github.com/caovinhphuc/react-google-integration/blob/main/${path}`;
    window.location.replace(githubUrl);
  }, [path]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #ff6b35 0%, #ff9500 100%)',
      color: 'white',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>📚 Redirecting to Documentation...</h2>
        <p>You will be redirected to GitHub documentation in a moment.</p>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
        <p>
          If redirect doesn't work, click{' '}
          <a 
            href={`https://github.com/caovinhphuc/react-google-integration/blob/main/${path}`}
            style={{ color: '#ffeb3b', textDecoration: 'underline' }}
            target="_blank" 
            rel="noopener noreferrer"
          >
            here
          </a>
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DocumentationRedirect;
