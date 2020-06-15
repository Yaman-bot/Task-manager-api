const mongoose=require('mongoose')
const validator=require('validator')
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,    
        trim:true,    //triming any spaces
        lowercase:true,  //Converting to lowercase
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password  cant contain "password"')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

//It is a way by which it establishes a relationship b/w TASK model and doesn't get stored in DB
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

//Manipulating the mongoose object by toJSON method as when 
//res.send() is called JSON.stringify() converts it into a JSON object
userSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//methods are accessible on instances so sometimes called instance methods
userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)

    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

//Statics methods are availabel on model so sometimes called model methods
userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email:email})
    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch=await bcryptjs.compare(password,user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

//Hash the plain text password before saving
userSchema.pre('save',async function(next){           //Can't use arrow fns due to binding of 'this'
    const user=this

    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8)
    }

    next() 
})

//Delete user tasks when user is removed
userSchema.pre('remove',async function(){
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})

const User=mongoose.model('User',userSchema)

module.exports=User