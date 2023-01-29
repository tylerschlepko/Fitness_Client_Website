import express from 'express'
import postgres from 'postgres';
import dotenv from "dotenv"
import { builtinModules } from "module";
import path from 'path'
import fs from 'fs'
import { html } from 'parse5';
import {JSDOM} from 'jsdom'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL)

const indexHtml = async (req, res) =>{ 
    try {
        res.sendFile(path.join(process.cwd(), 'index.html'))
    } catch (error) {
        throw error
    }
} /*gives the user the initial html file*/

const forgotPasswordLink = async (req, res) =>{ 
    try {
        res.sendFile(path.join(process.cwd(), 'reset-password.html'))
    } catch (error) {
        throw error
    }
} /*gives the user the forgot password html file when clicking on the link*/

const createAccountLink = async (req, res) =>{ 
    try {
        res.sendFile(path.join(process.cwd(), 'create-account.html'))
    } catch (error) {
        throw error
    }
} /*gives the user the create account html file when clicking on the link*/

const logInFunc =  async (req, res) =>{
    const {username, password} = req.body
    console.log(req.body)
    try {
        const data = await sql`
        SELECT id FROM login
        WHERE username = ${username} and password = ${password}
        ` /* Query for the form when the user puts in their username and password*/
        
        const {id} = data[0]
        
        const current = await sql`
        SELECT * FROM clients
        WHERE login_id = ${id}
        ` /* Query for the clients current status */
        
        const user = current[0] 
    
        const workoutPlan = await sql`
        SELECT * FROM workout_plans
        WHERE id = ${user.id}
        `
        const {plan} = workoutPlan[0] 

        const goals = await sql`
        SELECT * FROM client_goals
        WHERE client_id = ${user.id}
        ` /* Query for the clients current goals */
        


        const htmlpath = path.join(process.cwd(), 'login.html')
        const html = fs.readFileSync(htmlpath)
        const dom = new JSDOM(html)
        const {document} = dom.window
        
        let goalTime = new Date(goals[0].time);
        let now = new Date()
        let diffInMs= goalTime - now
        let diffInDays = Math.floor(diffInMs / 86400000)

        document.getElementById("goal-time").innerHTML = `${diffInDays} days`
        document.getElementById("goalWeight").innerHTML = goals[0].weight
        document.getElementById("goalDeadlift").innerHTML = goals[0].deadlift
        document.getElementById("goalBench").innerHTML = goals[0].bench
        document.getElementById("goalSquat").innerHTML = goals[0].squat 
        
        document.getElementById("currentWeight").innerHTML = user.current_weight
        document.getElementById("currentDeadlift").innerHTML = user.current_deadlift
        document.getElementById("currentBench").innerHTML = user.current_bench
        document.getElementById("currentSquat").innerHTML = user.current_squat 
        

        document.getElementById("user_header").innerHTML = user.first_name + " " + user.last_name + " | "  + plan + " | " + "Week " + user.plan_week
        const updatedHtml = dom.serialize()
        fs.writeFileSync(htmlpath, updatedHtml, 'utf-8')
        res.sendFile(path.join(process.cwd(), 'login.html'))
    } catch (error) {
        throw error
    }
}


export {forgotPasswordLink, createAccountLink, logInFunc, indexHtml}