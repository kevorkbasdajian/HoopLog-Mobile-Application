import * as authService from "../services/authService.js";

// POST /auth/signup
export async function signup(req, res, next) {
  try {
    const { fullName, email, password } = req.body;
    const result = await authService.signup({ fullName, email, password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// POST /auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
