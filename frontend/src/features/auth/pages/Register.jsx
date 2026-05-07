import React from 'react'
import {useNavigate, Link} from 'react-router'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const Register = () => {

  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const {loading,handleRegister,user} = useAuth()

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError("")
    try {
      await handleRegister({username,email,password})
    } catch (err) {
      setError(err.message || "Registration failed")
    }
  }

  // Navigate after user is set
  React.useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  if(loading){
    return(
      <main className="auth-page">
        <h1>Loading....</h1>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <div className="form-container">
        <h1>Register</h1>
        <p className="auth-subtitle">Create an account to generate personalized interview strategies.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>

           <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
            onChange={(e)=>setUsername(e.target.value)}
            type="text" id="username" name="username" placeholder="Enter Username" autoComplete="username" required/>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
            onChange={(e)=>setEmail(e.target.value)}
            type="email" id="email" name="email" placeholder="Enter email address" autoComplete="email" required/>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
            onChange={(e)=>setPassword(e.target.value)}
            type="password" id="password" name="password" placeholder="Enter password" autoComplete="new-password" required/>
          </div>

          <button className='button primary-button'>Register</button>
        </form>

        <p>Already have an account? <Link to={"/login"}>Login</Link></p>
      </div>
    </main>
  )
}

export default Register
