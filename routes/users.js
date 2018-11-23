var express = require('express');
var router = express.Router();
const {insertAccount, activeUser, loginUser, verifyJWT, blockOrDeleteUsers } = require('../database/models/Account')

router.use((req, res, next) =>
{
    console.log('Time:', Date.now()) //Time log
    next()
})
//router dang ki
router.post('/registerUser', async (req, res) => 
{
    let {name, email, password} = req.body// name = req.body.name
    try{
      await insertAccount(name , email, password)
      res.json(
        {
          result : 'ok',
          message: 'Dang ki user thanh cong, ban can mo email de kich hoat'
        }
      )

    }
    catch(error)
    {
      res.json(
        {
          result: 'failed',
          message: `Khong the dang ki them User. Loi: ${error}`
        }
      )
    }
})

//router de kich hoat users

router.get('/activateUser', async (req, res) =>
{
  let{email, secretKey} = req.query;
  console.log(email)
  console.log(secretKey);
  try{
    await activeUser(email, secretKey)
    console.log("love")
    res.send(`<h1 style="color: red;"> Kich hoat User Thanh Cong</h1>`)
  }
  catch(error)
  {
    res.send(`<h1 style="color:green;">Khong kich hoat dc user. loi: ${error}</h1>`)
  }
})

//router de login 1 account

router.post('/loginUser', async (req, res) =>
{
  let{email,password} = req.body;
  try{
     let tokenKey = await loginUser(email, password)
    
     res.json(
       {
         result: 'ok',
         message: ' Dang nhap user thanh cong',
         tokenKey:  tokenKey// nguoi dung se copy cai token nay va goi cac api khac
       }
     )

  }
  catch(error)
  {
    res.json(
      {
        result: 'failed',
        message: `Khong the dang nhap users. Loi: ${error}`
      }
    )
  }
})

// viet 1 API test tokenKey
router.get('/testJWT', async (req, res) =>
{
  let tokenKey = req.header('x-access-token')
  try{
    //verify token
    await verifyJWT(tokenKey)
    res.json(
      {
        result: 'ok',
        message: 'Verify Json token web thanh cong'
      }
    )
  }
  catch(error)
  {
    res.json(
      {
        result: 'failed',
        message: `Loi kiem tra token: ${error}`
      }
    )
  }
})

//Viet api block or delete router.

router.post('/admin/blockOrDeleteUsers', async (req, res) =>
{
  let tokenKey = req.headers['x-access-token']
  let {userIds, actionType} = req.body;
  userIds = userIds.split(',') //Bien string thanh Array
  try{
    await blockOrDeleteUsers(userIds, tokenKey,actionType)
    res.json(
      {
       result: 'ok',
       message: 'Block user thanh cong', 
      }
    )
  }
  catch(error)
  {
    res.json(
      {
        result: 'failed',
        message: `Loi delete/block user. Error = ${error}`
      }
    )
  }

})


module.exports = router;
