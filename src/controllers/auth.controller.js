import JWT from 'jsonwebtoken'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { User } from '../models'
dotenv.config()

const { tokenSecret } = process.env
const jwtOptions = {
  issuer: 'boyepanthera',
  expiresIn: '7d',
}

export const RegisterController = async (req, res) => {
  try {
    let { userName } = req.body
    let user = await User.findOne({ userName })
    if (user)
      return res
        .status(400)
        .json({ message: 'account already exist login instead' })
    const createdUser = await User.create(req.body)
    let { _id, email } = createdUser
    let token = JWT.sign(
      { _id, email, userName: createdUser.userName },
      tokenSecret,
      jwtOptions
    )
    return res.status(201).json({ message: 'registration successful', token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const LoginController = async (req, res) => {
  try {
    let { login, password } = req.body
    let user = await User.findOne({
      $or: [{ email: login }, { userName: login }],
    })
    // console.log(user)
    if (!user)
      return res
        .status(404)
        .json({ message: 'no account found, register instead' })
    let { _id, userName, email } = user
    const isPasswordCorrect = bcrypt.compareSync(password, user.password)
    if (!isPasswordCorrect)
      return res.status(400).json({
        message: 'incorrect password',
      })
    let token = JWT.sign({ _id, email, userName }, tokenSecret, jwtOptions)
    return res.status(201).json({ message: 'login successful', token })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message })
  }
}
