const express=require('express')
const Task=require('../models/task')
const auth=require('../middleware/auth')
const router=new express.Router()


//============
//TASK ROUTES
//============
router.post('/tasks',auth,async (req, res) => {

    const task=new Task({
        ...req.body,
        owner:req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(err){
        res.status(400).send(err)
    }
    
})


router.get('/tasks',auth,async (req, res) => {
    //Filtering Data
    //GET /tasks?completed=true
    const match={}
    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }

    //Sorting Data
    // tasks/?sortBy=createdAt:asc
    const sort={}
    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc' ?-1:1
    }

    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),   // tasks?limit=2&skip=1 
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        //2nd Method-->
        //const tasks=await Task.find({owner:req.user._id})

        res.send(req.user.tasks)
    }catch(err){
        console.log(err)
        res.status(400).send()
    }
    
})

router.get('/tasks/:id',auth,async (req, res) => {
    const _id = req.params.id

    try{
        const task=await Task.findOne({ _id,owner:req.user._id })
        if (!task) {
            return res.status(404).send()
        }
    }catch(err){
        res.status(500).send()
    }
})


router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['description','completed']
    const isValidOperation=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!!!'})
    }

    try{
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})

        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update)=> task[update]=req.body[update])
        await task.save()

        //The findByIDAndUpdate method bypasses the mongoose middleware so we don't go by this method
        //const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        
        res.send(task)
    }catch(err){
        res.status(400).send()
    }
})

router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const task=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }catch(err){
        res.status(500).send()
    }
})

module.exports=router