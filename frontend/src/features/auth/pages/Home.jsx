import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router'
import '../style/home.scss'

const Home = () => {
  const { user, handleLogout, loading } = useAuth()
  const navigate = useNavigate()

  const handleLogoutClick = async () => {
    await handleLogout()
    navigate('/login')
  }

  if (loading) {
    return (
      <main>
        <h1>Loading....</h1>
      </main>
    )
  }

  return (
    <main>
      <div className='home-header'>
        <h1>Welcome to Home</h1>
        <button 
          onClick={handleLogoutClick}
          className='button primary-button logout-btn'
        >
          Logout
        </button>
      </div>

      <div className='home-content'>
        {user && (
          <div className='user-info'>
            <h2>User Information</h2>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default Home
