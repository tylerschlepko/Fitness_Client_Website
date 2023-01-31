import express from 'express'
import postgres from 'postgres';
import dotenv from "dotenv"
import { builtinModules } from "module";
import path from 'path'
import fs from 'fs'
import { html } from 'parse5';
import {JSDOM} from 'jsdom'
import { time } from 'console';

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
        document.getElementById("goalWeight").innerHTML = goals[0].weight + ' lbs'
        document.getElementById("goalDeadlift").innerHTML = goals[0].deadlift + ' lbs'
        document.getElementById("goalBench").innerHTML = goals[0].bench + ' lbs'
        document.getElementById("goalSquat").innerHTML = goals[0].squat + ' lbs'
        
        document.getElementById("currentWeight").innerHTML = user.current_weight + ' lbs'
        document.getElementById("currentDeadlift").innerHTML = user.current_deadlift + ' lbs'
        document.getElementById("currentBench").innerHTML = user.current_bench + ' lbs'
        document.getElementById("currentSquat").innerHTML = user.current_squat + ' lbs'
        

        document.getElementById("user_header").innerHTML = user.first_name + " " + user.last_name + " | "  + plan + " | " + "Week " + user.plan_week
        document.getElementById("user_header").setAttribute('name', user.id)
        const updatedHtml = dom.serialize()
        fs.writeFileSync(htmlpath, updatedHtml, 'utf-8')
        res.sendFile(path.join(process.cwd(), 'login.html'))
    } catch (error) {
        res.sendFile(path.join(process.cwd(), 'index.html'))
    }
} /**Checks if the user exists and if they do it sends them to the logged in
page with all of their information from the database if they dont exist
it will send them back the index html */

const updateGoals = async (req, res) =>{
    const {newSquat, newBench, newDeadlift, newWeight, newDate} = req.body
    

    const htmlpath = path.join(process.cwd(), 'login.html')
    const html = fs.readFileSync(htmlpath)
    const dom = new JSDOM(html)
    const {document} = dom.window

    const userId = document.getElementById('user_header').getAttribute('name')

    const user = {
        id : userId,
        "squat": newSquat, 
        "bench": newBench, 
        "deadlift": newDeadlift, 
        "weight": newWeight, 
        "time": newDate
    }

    console.log(user['squat'])
    let goalTime = new Date(user["time"]);
    let now = new Date()
    let diffInMs= goalTime - now
    let diffInDays = Math.floor(diffInMs / 86400000)

    await sql`
        UPDATE client_goals SET ${
            sql(user, "squat", "bench", "deadlift", 'weight', "time")
        }
        WHERE client_id = ${user.id}
    `

    document.getElementById("goal-time").innerHTML = `${diffInDays} days`
    document.getElementById("goalWeight").innerHTML = user["weight"] + ' lbs'
    document.getElementById("goalDeadlift").innerHTML = user["deadlift"] + ' lbs'
    document.getElementById("goalBench").innerHTML = user["bench"] + ' lbs'
    document.getElementById("goalSquat").innerHTML = user["squat"] + ' lbs'

    const updatedHtml = dom.serialize()
    fs.writeFileSync(htmlpath, updatedHtml, 'utf-8')
    res.sendFile(path.join(process.cwd(), 'login.html'))
}/**Updates all of the clients current goal from the inputs
they put in the form */

const updateCurrent = async (req, res) =>{
    const {updateSquat, updateBench, updateDeadlift, updateWeight} = req.body
    

    const htmlpath = path.join(process.cwd(), 'login.html')
    const html = fs.readFileSync(htmlpath)
    const dom = new JSDOM(html)
    const {document} = dom.window

    const userId = document.getElementById('user_header').getAttribute('name')

    const user = {
        id : userId,
        "current_squat" : updateSquat, 
        "current_bench" : updateBench, 
        "current_deadlift" : updateDeadlift, 
        "current_weight" : updateWeight 
    }

    await sql`
        UPDATE clients SET ${
            sql(user, "current_squat", "current_bench", "current_deadlift", "current_weight")
        }
        WHERE id = ${user.id}
    `

    document.getElementById("currentWeight").innerHTML = user["current_weight"] + ' lbs'
    document.getElementById("currentDeadlift").innerHTML = user["current_deadlift"] + ' lbs'
    document.getElementById("currentBench").innerHTML = user["current_bench"] + ' lbs'
    document.getElementById("currentSquat").innerHTML = user["current_squat"] + ' lbs'
        
    const updatedHtml = dom.serialize()
    fs.writeFileSync(htmlpath, updatedHtml, 'utf-8')
    res.sendFile(path.join(process.cwd(), 'login.html'))
} /**Updates the client's current status from the 
inputs they put in for the form */

const createNewUser = async (req, res) =>{
    try {
        const {username, password, email, first_name, last_name, current_squat, current_bench, current_deadlift, current_weight, squat, bench, deadlift, weight, date} = req.body
        console.log(req.body)
        
        await sql`
        INSERT INTO login (username, password, email)
        VALUES (${username}, ${password}, ${email})
        `
        const id = await sql`
        SELECT id FROM login 
        WHERE username = ${username}
        `
        const loginId = id[0].id

        await sql`
        INSERT INTO clients (first_name, last_name, plan_week, current_squat, current_bench, current_deadlift, current_weight, workout_plan_id, login_id)
        VALUES (${first_name}, ${last_name}, 1, ${parseInt(current_squat)}, ${parseInt(current_bench)}, ${parseInt(current_deadlift)}, ${parseInt(current_weight)}, 1, ${parseInt(loginId)})
        `
    
        const userId = await sql`
        SELECT id FROM clients
        WHERE login_id = ${parseInt(loginId)}
        `

        const clientId = userId[0].id

        console.log(clientId)
    
        await sql`
        INSERT INTO client_goals (squat, bench, deadlift, weight, time, client_id)
        VALUES (${parseInt(squat)}, ${parseInt(bench)}, ${parseInt(deadlift)}, ${parseInt(weight)}, ${date}, ${parseInt(clientId)})
        `

        res.sendFile(path.join(process.cwd(), 'index.html'))
    } catch (error) {
        throw error
    }
}

const resetPassword = async (req, res) =>{

}

export {forgotPasswordLink, createAccountLink, logInFunc, indexHtml, updateGoals, updateCurrent, createNewUser, resetPassword}