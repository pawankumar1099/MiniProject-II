import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'


const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    bio:{
        type:String,
        maxLength:200
    },
    profilePic:{
        type:String,
        default:""
    },
    location:{
        type:String,
        default:""
    },
    isOnboarded:{
        type:Boolean,
        default:false
    },
    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
},
    {timestamps:true}
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')){
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User",userSchema);

export default User;