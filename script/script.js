//Ham Script nay se chua ham phong 1 User thanh admin
// Ham nay se khong duoc viet htanh API, phai chay bang terminal.

const {mongoose} = require('../database/database');
const {Account} = require('../database/models/Account');
const makeUserBecomeAdmin = async (userId) =>
{
    try{
        // Tim User voi id = id User va update truong permission
        let user = await Account.findById(userId);
        if (!user)
        {
            console.log(`Khong tim thay user voi id = ${userId}`)
            return
        }
        user.active = 1;
        user.isBanned = 0;
        user.permission = 2;
        await user.save()
        console.log(`Da "phong" admin cho user: ${userId} `)



    }
    catch(error)
    {
        console.log(` Khong the update user dc voi UserID = ${error}`)

    }
}

makeUserBecomeAdmin('5bf535e5ed157538e98f8667')