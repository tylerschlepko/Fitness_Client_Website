import {resetPassword, deleteAccount, createNewUser ,updateCurrent, logInFunc, indexHtml, forgotPasswordLink, createAccountLink, updateGoals} from './client.js'
import express from "express";
import dotenv from 'dotenv'
import path from 'path'
import { get } from 'http';
import postgres from 'postgres';
import {JSDOM} from 'jsdom'

dotenv.config()
const sql = postgres(process.env.DATABASE_URL)
const PORT = process.env.PORT

const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static(path.join(process.cwd(), 'public')))

app.get('/', indexHtml)

app.get('/create-account', createAccountLink)

app.get('/reset-password', forgotPasswordLink)

app.post('/login', logInFunc)

app.post('/update_current', updateCurrent)

app.post('/update_goals', updateGoals)

app.post('/make-account', createNewUser)

app.post('/reset', resetPassword)

app.post('/delete', deleteAccount)

app.listen(PORT, (error)=>{
    if (error){
        throw error
    }
    console.log(`App listening on port ${PORT}`)
})
