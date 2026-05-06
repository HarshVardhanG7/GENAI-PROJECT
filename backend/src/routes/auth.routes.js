const express = require("express")
const authController = require("../controllers/auth.controller")
const authRouter = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")
/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register",authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description Login user with email and password
 * @access Public 
 */
authRouter.post("/login",authController.loginUserController)

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookies and add the token in blacklist
 * @access Public
 */
authRouter.get("/logout",authController.logoutUserController)


/**
 * @route GET /api/auth/getme
 * @description get the current logged in user details
 * @acces private
 */

authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)

module.exports = authRouter