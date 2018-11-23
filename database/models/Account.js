const {mongoose} = require('../database')
const bcrypt = require('bcryptjs');
const {Schema} = mongoose
const {sendEmail} = require('../../helpers/utility')
const jwt = require('jsonwebtoken')// ma hoa 1 jsonObject thanh token(string)
const secretString = "secret string"// tu cho 1 string tuy y
const ACTION_BlOCK_USER = "ACTION_BLOCK_USER"
const ACTION_DELETE_USER = "ACTION_DELETE_USER"
const {deleteBlogPostByAuthor} = require('./BlogPost')
const AccountSchema = new Schema(
    {
        //Schema: cau truc cua 1 collection.
        name: {type: String, default: 'unknown', unique: true},    
        email: {type: String, match:/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, unique: true},
        password: {type: String, require: true},    
        active: {type: Number, default: 0}, //inactive  
        permission: {type: Number, default: 0},// 0: user, 1: moderator, 2: admin
        isBanned: {type: Number, default: 0},// 0: khong bi khoa, 1: bi khoa tai khoan
        //truong tham chieu
        blogPosts: [{type: mongoose.Schema.Types.ObjectId , ref:'BlogPost'}],
        
         
    }
)

// chuyen tu schema sang model.
const Account = mongoose.model('Account', AccountSchema);

const insertAccount = async (name, email, password) => {
    try {
    	//Mã hoá password trước khi lưu vào DB
	    const encryptedPassword = await bcrypt.hash(password, 10)//saltRounds = 10
        const newUser = new Account()
        newUser.name = name
        newUser.email = email
        newUser.password = encryptedPassword        
        await newUser.save()
        await sendEmail(email, encryptedPassword)
    } catch(error) {
        //Tự tuỳ chỉnh lại Error
        if (error.code === 11000) {
        	throw "Tên hoặc email đã tồn tại"
        }
        //throw error
    }
}

//Ham activeUser dung de get 1 request
//viet ham nhan mail kich hoat
const activeUser = async (email, secretKey) =>
{
    console.log(email)
    console.log(secretKey)
    console.log("idiot you dumb");
    try{
        let foundAccount = await Account.findOne({email, password: secretKey}).exec()
        if(!foundAccount)
        {
            throw "Khong tim thay user de kich hoat"
        }

        if(!foundAccount.isBanned === 1)
        {
            throw " User bi khoa tai khoan do vi pham dieu khoan"
        }
        else if (foundAccount.active === 0)
        {
            foundAccount.active = 1;
            await foundAccount.save()
        }
        else{
            throw "Tai khoan tren da duoc kich hoat"
        }

    }
    catch(error)
    {
        throw error
    }
}

// viet API dang nhap User voi Json web token. = ma~ hoa 1 object thanh 1 string 
//viet ham login User
const loginUser = async (email, password) =>
{
    try{

        let foundUser = await Account.findOne({email: email.trim()}).exec()
        if(!foundUser)
        {
            throw "User khong ton tai"
        }

        if(!foundUser.isBanned === 1)
        {
            throw " User bi khoa tai khoan do vi pham dieu khoan"
        }
        if(foundUser.active === 0)
        {
            throw "User chua duoc kich hoat, Ban phai mo mail de kich hoat truoc"
        }

        let encryptedPassword = foundUser.password
        let checkPassword = await bcrypt.compare(password, encryptedPassword)
        if(checkPassword === true)
        {
            //Dang nhap thanh cong
            let jsonObject = {
                id: foundUser._id
            }

            let tokenKey = await jwt.sign(jsonObject,secretString,{expiresIn: 86400})// expiresIn: 86400  = expires trong 24h
            console.log(tokenKey)

            return tokenKey;

        }


    }
    catch(error)
    {
        throw error;

        
    }
}
// verify 1 tocken
const verifyJWT = async (tokenKey) =>
{
    try{
        let decodedJson = await jwt.verify(tokenKey, secretString)
        console.log(decodedJson)
        if(Date.now() /1000 > decodedJson.exp)
        {
            throw "Token het han, moi ban login lai"
        }
            let foundUser = await Account.findById(decodedJson.id);
           
            if(!foundUser)
            {
                throw "Khong tim thay user nay"
            }

            if(!foundUser.isBanned === 1)
            {
                throw " User bi khoa tai khoan do vi pham dieu khoan"
            }
            return foundUser;
            
        
    }

    catch(error)
    {
        throw error;

    }
}

//Ham danh rieng cho admin
const blockOrDeleteUsers = async (userIds, tokenKey, actionType) =>
{
    //Admin co the khoa nhieu User cung 1 luc
    try{
        let signinUser = await verifyJWT(tokenKey);
        if(signinUser.permission !== 2)
        {
            throw 'Chi co tai khoan Admin moi co chuc nang nay'
        }

        userIds.forEach(async (userId) =>
        {
            let user = await Account.findById(userId);
            if(!user)
            {
                return
            }
    // Xoa hay block?

    if(actionType === ACTION_BlOCK_USER)
    {
        user.isBanned = 1
        await user.save()
    }
    else if(actionType === ACTION_DELETE_USER)
    {
        //Gom 2 buoc
        //Buoc 1. Xoa het blogPosts cua User
        await deleteBlogPostByAuthor(userId)
        //Buoc 2. Xoa user
        await Account.findByIdAndDelete(userId)
    }
        })

        
    }
    catch(error)
    {
        throw error;
    }
}


module.exports = {Account, insertAccount, activeUser, loginUser, verifyJWT, blockOrDeleteUsers}