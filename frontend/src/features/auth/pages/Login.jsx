import React from 'react'
import "../auth.form.scss"
import{useNavigate,Link} from 'react-router'
import {useAuth} from "../hooks/useAuth"
import { useState } from 'react'

const Login = () => {

  const {loading,handleLogin,user} = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError("")
    try {
      await handleLogin({email,password})
    } catch (err) {
      setError(err.message || "Login failed")
    }
  }

  // Navigate after user is set
  React.useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  if(loading){
    return (
      <main className="auth-page">
        <h1>Loading....</h1>
      </main>
    )
  }
  return (
    <main className="auth-page">
      <div className="form-container">
        <h1>Login</h1>
        <p className="auth-subtitle">Welcome back! Log in to continue building your interview strategy.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
            onChange={(e)=>{setEmail(e.target.value)}}
            type="email" id="email" name="email" placeholder="Enter email address" autoComplete="email" required/>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
            onChange = {(e)=>(setPassword(e.target.value))}
            type="password" id="password" name="password" placeholder="Enter password" autoComplete="current-password" required/>
          </div>

          <button className='button primary-button'>Login</button>
        </form>

        <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
      </div>
    </main>
  )
}

export default Login
