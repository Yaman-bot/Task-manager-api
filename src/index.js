const express=require('express')
require('./db/mongoose')  //Connecting to the mongodb database   
const userRouter=require('./routers/users')
const taskRouter=require('./routers/tasks')

const app=express()
const port=process.env.PORT

//Our express middleware
// app.use((req,res,next)=>{
//     if(req.method==='GET'){
//         res.send('GET requests are disabled')
//     }else{
//         next()
//     }
// })

app.use(express.json())


app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=>{
    console.log(`Server is running on ${port}!!!`)
})