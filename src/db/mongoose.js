const mongoose=require('mongoose')



mongoose.connect(process.env.MONGODB_URL,{  //Note->The db name is imp
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify:false
})


